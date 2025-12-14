import type { VercelRequest, VercelResponse } from '@vercel/node'
import { fetchPrData } from './utils/github'
import { triggerKestra } from './utils/kestra'
import { getMockAnalysis, mockSummarize } from './utils/mock'
import type { AnalysisResult } from '../src/types'
import fs from 'fs'
import path from 'path'

function parsePrUrl(prUrl: string) {
  const match = prUrl.match(/github\.com\/([^/]+)\/([^/]+)(?:\/pull\/(\d+))?/) // allow repo or PR link
  if (!match) {
    throw new Error('Invalid GitHub URL format. Expected: https://github.com/owner/repo or /pull/123')
  }
  const [, owner, repo, prNumber] = match
  return { owner, repo, prNumber: prNumber ? parseInt(prNumber, 10) : 1 }
}

function buildResponsePayload(analysis: AnalysisResult, mode: 'demo' | 'live' | 'fallback', note?: string) {
  return {
    summary: analysis.summary || '',
    filesGrouped: {
      code: (analysis.filesGrouped?.code || []),
      tests: (analysis.filesGrouped?.tests || []),
      docs: (analysis.filesGrouped?.docs || [])
    },
    risks: Array.isArray(analysis.risks) ? analysis.risks : [],
    checklist: Array.isArray(analysis.checklist) ? analysis.checklist : [],
    shouldMerge: typeof analysis.shouldMerge === 'boolean' ? analysis.shouldMerge : false,
    explanation: analysis.explanation || (analysis.summary ? analysis.summary : ''),
    lintSummary: analysis.lintSummary || '',
    // Normalize source to 'kestra' or 'demo' for consumer simplicity
    source: analysis.source === 'kestra' ? 'kestra' : 'demo',
    mode,
    note
  }
}

async function buildDemoResult(owner: string, repo: string, prNumber: number) {
  const samplePath = path.join(process.cwd(), 'examples', 'sample-pr-1.md')
  let content = ''
  try {
    content = fs.readFileSync(samplePath, 'utf-8')
  } catch (err) {
    console.warn('Demo sample read failed, continuing with fallback mock content')
  }

  const summary = mockSummarize(content)
  const mockResult = getMockAnalysis(owner, repo, prNumber)
  mockResult.summary = summary.summary
  mockResult.filesGrouped = summary.filesGrouped
  mockResult.risks = summary.risks
  mockResult.checklist = summary.checklist
  mockResult.shouldMerge = summary.shouldMerge
  mockResult.explanation = summary.explanation
  mockResult.lintSummary = summary.lintSummary
  return mockResult
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // NOTE: Kestra is backend-only by design. Do not expose Kestra endpoints to the browser.
  // Frontend should call /api/analyze on the backend which will handle all Kestra interactions.
  // Ensure we always respond with JSON (if runtime supports setHeader)
  try {
    if (typeof (res as any).setHeader === 'function') (res as any).setHeader('Content-Type', 'application/json')
  } catch (e) {
    // ignore in runtimes without setHeader (edge, mocked tests)
  }
  console.info('[analyze] Analyze called')
  console.info('[analyze] PR URL:', req.body?.prUrl)
  console.info('[analyze] Kestra configured:', {
    apiUrl: Boolean(process.env.KESTRA_API_URL),
    tenantId: Boolean(process.env.KESTRA_TENANT_ID),
    flowId: Boolean(process.env.KESTRA_FLOW_ID),
    apiKey: Boolean(process.env.KESTRA_API_KEY)
  })

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  try {
    // If request body is a string (raw body), try to parse it to JSON
    let reqBody: any = req.body || {}
    if (typeof req.body === 'string') {
      try {
        reqBody = JSON.parse(req.body)
      } catch (err) {
        console.warn('[analyze] Could not parse request body as JSON')
      }
    }
    const { prUrl, demoMode } = reqBody || {}
    if (!prUrl || typeof prUrl !== 'string') {
      return res.status(400).json({ success: false, error: 'Invalid PR URL provided' })
    }

    // Demo mode is enabled when request explicitly sets `demoMode: true`,
    // or when server-side `DEMO_MODE` or `VITE_DEMO_MODE` env vars are set to 'true'.
    const isDemo = demoMode === true || process.env.DEMO_MODE === 'true' || process.env.VITE_DEMO_MODE === 'true' || req.body?.demo === true

    let owner: string, repo: string, prNumber: number
    try {
      ;({ owner, repo, prNumber } = parsePrUrl(prUrl))
      console.info('[analyze] Parsed PR info:', { owner, repo, prNumber })
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err?.message || 'Invalid GitHub PR URL' })
    }

    if (isDemo) {
      console.info('[analyze] Using demo mode (request or env flag)')
      const mockResult = await buildDemoResult(owner, repo, prNumber)
      return res.status(200).json({ success: true, ...buildResponsePayload(mockResult, 'demo') })
    }

    // Ensure GitHub fetch failures are handled explicitly
    const githubToken = process.env.GITHUB_TOKEN
    if (!githubToken) {
      return res.status(400).json({ success: false, error: 'GITHUB_TOKEN is required for live analysis. Enable demoMode for mock results.' })
    }

    let prFetch
    try {
      // Ensure we pass a canonical PR URL to fetchPrData (owner/repo/pull/{n})
      const canonicalPrUrl = `https://github.com/${owner}/${repo}/pull/${prNumber}`
      prFetch = await fetchPrData(canonicalPrUrl, githubToken)
      console.info('[analyze] Live mode with GitHub data')
    } catch (err: any) {
      console.error('[analyze] GitHub fetch failed:', err?.message || String(err))
      return res.status(400).json({ success: false, error: 'Failed to fetch GitHub PR: ' + (err?.message || ''), source: 'github' })
    }

    // Non-demo mode: attempt Kestra but don't crash if it's not configured or fails
    const kestraConfigured = Boolean(process.env.KESTRA_API_URL && process.env.KESTRA_TENANT_ID && process.env.KESTRA_FLOW_ID)
    if (!kestraConfigured) {
      console.warn('[analyze] Kestra is not configured for live analysis; will fall back to mock')
    }

    console.info('[analyze] Fetching GitHub PR')
    let analysis: AnalysisResult | null = null

    if (kestraConfigured) {
      try {
        const kestraPayload = {
          prNumber,
          repository: `${owner}/${repo}`,
          prTitle: prFetch.title,
          prBody: '',
          prDiff: prFetch.diffText,
          author: prFetch.author,
          filesChanged: prFetch.files.length,
          additions: 0,
          deletions: 0
        }
        console.info('[analyze] Triggering Kestra execution with payload keys:', Object.keys(kestraPayload).join(','))
        try {
          analysis = await triggerKestra(kestraPayload, {
            apiUrl: process.env.KESTRA_API_URL as string,
            apiKey: process.env.KESTRA_API_KEY as string,
            tenantId: process.env.KESTRA_TENANT_ID as string,
            flowId: process.env.KESTRA_FLOW_ID as string,
            timeoutMs: process.env.KESTRA_TIMEOUT ? Number(process.env.KESTRA_TIMEOUT) : undefined
          })
          console.info('[analyze] Kestra execution success')
        } catch (kestraErr: any) {
          console.error('[analyze] Kestra execution failed:', kestraErr?.message || kestraErr)
          const allowFallback = process.env.KESTRA_FALLBACK_ON_ERROR !== 'false'
          // If the error is a 404 / flow not found, fallback to demo automatically
          if (kestraErr?.kestraNotFound) {
            console.warn('[analyze] Kestra flow not found; falling back to demo')
            analysis = null
          } else {
            // Do not return 502 to the client — always fall back to the deterministic mock
            // to keep the deployed app reliable and avoid proxy errors.
            console.warn('[analyze] Kestra execution failed; falling back to mock summarizer:', kestraErr?.message || String(kestraErr))
            analysis = null
          }
        }

        // Validate required outputs
        const missingFields: string[] = []
        if (!analysis?.summary) missingFields.push('summary')
        if (!analysis?.filesGrouped) missingFields.push('filesGrouped')
        if (!analysis?.risks) missingFields.push('risks')
        if (!analysis?.checklist) missingFields.push('checklist')
        if (typeof analysis?.shouldMerge !== 'boolean') missingFields.push('shouldMerge')
        if (!analysis?.explanation) missingFields.push('explanation')
        if (!analysis?.lintSummary) missingFields.push('lintSummary')
        if (analysis && !analysis.source) analysis.source = 'kestra'

        if (missingFields.length) {
          console.warn('[analyze] Kestra returned incomplete outputs:', missingFields.join(', '))
          analysis = null
        }
      } catch (err: any) {
        console.warn('[analyze] Kestra execution failed, falling back to mock:', err?.message || String(err))
        analysis = null
      }
    }

    if (!analysis) {
      console.info('[analyze] Falling back to mock summarizer')
      const summary = mockSummarize(prFetch.diffText)
      analysis = {
        title: prFetch.title,
        summary: summary.summary,
        filesGrouped: summary.filesGrouped,
        risks: summary.risks,
        checklist: summary.checklist,
        shouldMerge: summary.shouldMerge,
        explanation: summary.explanation,
        lintSummary: summary.lintSummary,
        metadata: {
          prNumber,
          repository: `${owner}/${repo}`,
          author: prFetch.author,
          filesChanged: prFetch.files.length,
          additions: 0,
          deletions: 0
        },
        source: 'demo'
      }
    }

    const mode = analysis.source === 'kestra' ? 'live' : 'fallback'
    try {
      console.info('[analyze] Returning result source=%s mode=%s', analysis.source, mode)
      return res.status(200).json({ success: true, ...buildResponsePayload(analysis, mode, mode === 'fallback' ? 'Fallback to mock summary' : undefined) })
    } catch (err: any) {
      console.error('[/api/analyze] Error sending JSON response:', err)
      return res.status(500).json({ success: false, error: 'Failed to send analysis result', source: 'server' })
    }
  } catch (error: any) {
    console.error('[/api/analyze] Fatal error:', error)
    return res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown server error', source: 'server' })
  }
}

// Improve diagnostics: capture uncaught errors in dev so logs show why process would crash
try {
  process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection at process:', reason)
  })
  process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception at process:', err)
  })
} catch (err) {
  // ignore if process isn't defined (edge runtimes)
}