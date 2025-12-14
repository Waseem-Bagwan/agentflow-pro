import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Hero from '../components/Hero'
import InputBar from '../components/InputBar'
import StepsSection from '../components/StepsSection'
import Header from '@/components/Header'
import { getMockAnalysis } from '@/utils/mock'
import type { AnalysisResult } from '@/types'

export default function HomePage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAnalyze = async (prUrl: string, demoMode = false) => {
    setLoading(true)
    setError(null)

    try {
      // Parse PR URL
      const prMatch = prUrl.match(/github\.com\/([^\/]+)\/([^\/]+)\/pull\/(\d+)/)

      if (!prMatch) {
        throw new Error('Invalid GitHub PR URL format. Expected: https://github.com/owner/repo/pull/123')
      }

      const [, owner, repo, prNumber] = prMatch

      console.log('🔍 Analyzing:', { owner, repo, prNumber })

      // If demoMode requested, use local deterministic demo without contacting backend
      if (demoMode) {
        const owner = prMatch[1]
        const repo = prMatch[2]
        const prNumber = prMatch[3] ? parseInt(prMatch[3], 10) : 1
        const demoResult: AnalysisResult = getMockAnalysis(owner, repo, prNumber)
        navigate('/results', { state: { result: { success: true, mode: 'demo', source: 'demo', ...demoResult }, prUrl } })
        return
      }

      // Call backend analysis endpoint
      let resp: Response
      try {
        resp = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prUrl, demoMode })
        })
      } catch (err: any) {
        // Network/connection error, fallback to demo
        console.warn('Backend unreachable; falling back to demo:', err?.message || err)
        const owner = prMatch[1]
        const repo = prMatch[2]
        const prNumber = prMatch[3] ? parseInt(prMatch[3], 10) : 1
        const demoResult: AnalysisResult = getMockAnalysis(owner, repo, prNumber)
        navigate('/results', { state: { result: { success: true, mode: 'demo', source: 'demo', ...demoResult }, prUrl } })
        return
      }

      const text = await resp.text()
      if (!text) {
        // Empty response — if server returned 500/502, fallback to demo automatically
        if (resp.status >= 500) {
          console.warn('Server returned empty body and status', resp.status, '— falling back to demo')
          const owner = prMatch[1]
          const repo = prMatch[2]
          const prNumber = prMatch[3] ? parseInt(prMatch[3], 10) : 1
          const demoResult: AnalysisResult = getMockAnalysis(owner, repo, prNumber)
          navigate('/results', { state: { result: { success: true, mode: 'demo', source: 'demo', ...demoResult }, prUrl } })
          return
        }
        throw new Error(`Empty response from the server (status ${resp.status}). The backend may be unreachable or misconfigured.`)
      }
      let json: any
      try {
        json = JSON.parse(text)
      } catch (err) {
        // If server returned non-JSON body (HTML error page), include a short snippet for debugging
        const snippet = text && text.length > 0 ? text.slice(0, 200) : ''
        // If this appears to be a server error (HTML error page or proxy HTML), fallback to demo
        if (resp.status >= 500 || snippet.toLowerCase().includes('gateway') || snippet.toLowerCase().includes('error')) {
          console.warn('Non-JSON response from backend; falling back to demo. Snippet:', snippet)
          const owner = prMatch[1]
          const repo = prMatch[2]
          const prNumber = prMatch[3] ? parseInt(prMatch[3], 10) : 1
          const demoResult: AnalysisResult = getMockAnalysis(owner, repo, prNumber)
          navigate('/results', { state: { result: { success: true, mode: 'demo', source: 'demo', ...demoResult }, prUrl } })
          return
        }
        throw new Error(`Invalid JSON response from server. Server body: "${snippet}"`)
      }
      if (!resp.ok) {
        // If backend returned structured JSON error, surface it rather than silently fallback
        if (json && json.success === false && (json.error || json.message)) {
          throw new Error(json.error || json.message)
        }
        // For 5xx without structured error, auto fallback to demo
        if (resp.status >= 500) {
          console.warn('Backend returned', resp.status, '— using demo fallback')
          const owner = prMatch[1]
          const repo = prMatch[2]
          const prNumber = prMatch[3] ? parseInt(prMatch[3], 10) : 1
          const demoResult: AnalysisResult = getMockAnalysis(owner, repo, prNumber)
          navigate('/results', { state: { result: { success: true, mode: 'demo', source: 'mock', ...demoResult }, prUrl } })
          return
        }
        throw new Error(json?.message || json?.error || `Analysis failed (non-200 response ${resp.status})`)
      }

      if (json?.success === false) {
        throw new Error(json?.error || json?.message || 'Analysis failed')
      }

      const result = json as any
      navigate('/results', { state: { result, prUrl } })

    } catch (err: any) {
      console.error('❌ Analysis error:', err)
      setError(err.message || 'Failed to analyze PR. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 transition-colors">
      <Header />
      <header className="max-w-5xl mx-auto px-6 py-12">
        <Hero />
      </header>
      <main className="max-w-5xl mx-auto px-6 pb-16 space-y-8">
        <InputBar onAnalyze={handleAnalyze} isLoading={loading} error={error} />
        <StepsSection />
      </main>
    </div>
  )
}
