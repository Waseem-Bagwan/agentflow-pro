import axios from 'axios'
import type { AnalysisResult } from '../../src/types'

export interface TriggerOpts {
  apiUrl: string
  apiKey?: string
  tenantId: string
  flowId: string
  namespace?: string
  timeoutMs?: number
}

export interface KestraInputs {
  prNumber: number
  repository: string
  prTitle?: string
  prBody?: string
  prDiff?: string
  author?: string
  filesChanged?: number
  additions?: number
  deletions?: number
}

export async function triggerKestra(inputs: KestraInputs, opts: TriggerOpts): Promise<AnalysisResult> {
  const namespace = opts.namespace || opts.tenantId || 'main'
  const flowId = opts.flowId
  // Normalize base: trim trailing slashes and drop any trailing '/api/v1' if present
  let base = opts.apiUrl.replace(/\/+$/, '')
  base = base.replace(/\/api\/v1$/, '')
  // Use the exact execution endpoints:
  // - POST to start an execution: /api/v1/executions/{namespace}/{flowId}
  // - GET to poll execution: /api/v1/executions/{executionId}
  const createEndpoint = `${base}/api/v1/executions/${encodeURIComponent(namespace)}/${encodeURIComponent(flowId)}`
  const statusEndpoint = (executionId: string) => `${base}/api/v1/executions/${encodeURIComponent(executionId)}`

  try {
    const payload = {
      inputs: {
        prNumber: Number(inputs.prNumber || 0),
        repository: inputs.repository || '',
        prTitle: inputs.prTitle || '',
        prBody: inputs.prBody || '',
        prDiff: inputs.prDiff || '',
        author: inputs.author || '',
        filesChanged: Number(inputs.filesChanged || 0),
        additions: Number(inputs.additions || 0),
        deletions: Number(inputs.deletions || 0)
      }
    }

    const headers: any = { 'Content-Type': 'application/json' }
    if (opts.apiKey) headers.Authorization = `ApiKey ${opts.apiKey}`

    const timeoutMs = opts.timeoutMs || Number(process.env.KESTRA_TIMEOUT) || 45_000
    console.info('[kestra] Creating execution at', createEndpoint)
    console.info('[kestra] Payload keys: %s', Object.keys(inputs).join(','))
    let resp: any = null
    try {
      resp = await axios.post(createEndpoint, payload, { headers, timeout: timeoutMs })
      console.info('[kestra] Create execution HTTP status:', resp?.status)
      console.info('[kestra] Create execution response id:', resp?.data?.id || resp?.data?.executionId || 'unknown')
    } catch (err: any) {
      console.warn('[kestra] Attempt failed for url %s: %s', createEndpoint, err?.response?.status || err?.message)
        if (err.response?.status === 401 || err.response?.status === 403) {
        throw new Error('Kestra authentication failed. Check KESTRA_API_KEY.')
      }
      if (err.response?.status === 404) {
        // Flow or namespace not found — caller should handle fallback to demo
        const msg = 'Kestra flow not found. Make sure workflow is uploaded to Kestra and the namespace/flow id are correct.'
        const e = new Error(msg) as any
        e.kestraNotFound = true
        throw e
      }
      throw new Error(`Kestra request failed: ${err.message || 'unknown error'}`)
    }
    const startedExec = resp?.data
    const executionId = startedExec?.id || startedExec?.executionId || (startedExec?.data?.id) || (startedExec?.data?.executionId)
    if (!executionId) {
      throw new Error('Kestra did not return an execution id')
    }
    console.info('[kestra] Execution started id:', executionId)

    // Poll execution status until completion or timeout
    const pollInterval = 2000
    const maxWaitMs = timeoutMs
    const maxAttempts = Math.ceil(maxWaitMs / pollInterval)
    let attempts = 0
    let finalExec: any = null
    while (attempts < maxAttempts) {
      attempts++
      try {
        const statusResp = await axios.get(statusEndpoint(String(executionId)), { headers, timeout: timeoutMs })
        finalExec = statusResp?.data
        const state = finalExec?.state?.current
        console.info('[kestra] Polling execution status:', state, `(attempt ${attempts}/${maxAttempts})`)
        if (state === 'SUCCESS') break
        if (state === 'FAILED' || state === 'KILLED' || state === 'KILLING') {
          throw new Error(`Kestra execution failed or killed (state=${state})`)
        }
      } catch (err: any) {
        // Continue polling on transient errors, but break on 404 if resource is missing
        if (err.response?.status === 404) {
          const e = new Error('Kestra execution not found') as any
          e.kestraNotFound = true
          throw e
        }
        if (attempts >= maxAttempts) {
          throw new Error('Kestra execution polling timed out')
        }
      }
      await new Promise((resolve) => setTimeout(resolve, pollInterval))
    }
    const exec = finalExec

    const outputs = exec?.outputs
    if (!outputs) throw new Error('Kestra execution returned no outputs')

    // Validate required fields are present
    const missingFields: string[] = []
    if (!outputs.summary) missingFields.push('summary')
    if (!outputs.checklist) missingFields.push('checklist')
    if (!outputs.risks) missingFields.push('risks')
    if (typeof outputs.shouldMerge !== 'boolean') missingFields.push('shouldMerge')
    if (!outputs.explanation) missingFields.push('explanation')

    if (missingFields.length) {
      throw new Error(`Kestra outputs missing required fields: ${missingFields.join(', ')}`)
    }

    const result: AnalysisResult = {
      title: outputs.title || inputs.prTitle || `PR ${inputs.prNumber}`,
      summary: outputs.summary || '',
      filesGrouped: {
        code: (outputs.filesGrouped?.code as string[]) || [],
        tests: (outputs.filesGrouped?.tests as string[]) || [],
        docs: (outputs.filesGrouped?.docs as string[]) || []
      },
      risks: (outputs.risks as string[]) || [],
      checklist: (outputs.checklist as string[]) || [],
      shouldMerge: typeof outputs.shouldMerge === 'boolean' ? outputs.shouldMerge : false,
      explanation: outputs.explanation || '',
      lintSummary: outputs.lintSummary || '',
      metadata: {
        prNumber: Number(inputs.prNumber || 0),
        repository: inputs.repository || '',
        author: inputs.author || '',
        filesChanged: Number(inputs.filesChanged || 0),
        additions: Number(inputs.additions || 0),
        deletions: Number(inputs.deletions || 0)
      },
      source: outputs.source || 'kestra'
    }

    return result
  } catch (err: any) {
    console.error('❌ Kestra error:', err.message)
    
    if (err.response?.status === 404) {
      throw new Error('Kestra flow not found. Make sure workflow is uploaded to Kestra.')
    }
    if (err.response?.status === 401 || err.response?.status === 403) {
      throw new Error('Kestra authentication failed. Check KESTRA_API_KEY.')
    }
    
    throw new Error(`Kestra request failed: ${err.message}`)
  }
}

export default triggerKestra