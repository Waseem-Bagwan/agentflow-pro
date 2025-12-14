import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AnalysisResult } from '../types'
import { AlertTriangle, ArrowLeft, CheckCircle2, ExternalLink, FileText, ListChecks, XCircle } from 'lucide-react'

export default function ResultsPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [prUrl, setPrUrl] = useState<string>('')

  useEffect(() => {
    if ((location.state as any)?.result) {
      const state = location.state as { result: AnalysisResult; prUrl?: string }
      setResult(state.result)
      setPrUrl(state.prUrl || '')
    } else {
      navigate('/')
    }
  }, [location, navigate])

  const checklist = useMemo(() => {
    if (!result) return []
    return (result.checklist || []).map((text, idx) => ({
      id: String(idx + 1),
      text,
      completed: idx < 3 // simple visual default
    }))
  }, [result])

  if (!result) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 transition-colors">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 shadow-sm sticky top-0 z-10 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Home</span>
            </Link>
            <div className="flex items-center gap-3">
                <span className="text-sm text-slate-500 dark:text-slate-300">Analysis Complete</span>
                {result.source === 'kestra' ? (
                  <div className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-200 px-3 py-1 rounded-full text-xs font-medium">Live Kestra Analysis</div>
                ) : (
                  <div className="bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-200 px-3 py-1 rounded-full text-xs font-medium">Demo Mode</div>
                )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {result.mode === 'fallback' && (
          <div className="rounded-lg border border-amber-200 bg-amber-50/80 py-3 px-4 mb-4 text-amber-800">
            <strong>Kestra unavailable — fell back to mock analysis.</strong>
            {result.note && <span className="ml-2">{result.note}</span>}
          </div>
        )}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 transition-colors">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">PR Analysis Results</h1>
              <div className="flex flex-wrap items-center gap-2 text-slate-600 dark:text-slate-300">
                <span className="font-mono text-sm bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded">
                  {result.metadata?.repository || 'Repository'}
                </span>
                <span className="text-slate-400 dark:text-slate-500">•</span>
                <span>PR #{result.metadata?.prNumber || '1'}</span>
                {prUrl && (
                  <>
                    <span className="text-slate-400 dark:text-slate-500">•</span>
                    <a
                      href={prUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-200"
                    >
                      View on GitHub
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div
          className={`rounded-xl shadow-lg border p-6 transition-colors ${
            result.shouldMerge
              ? 'bg-green-50 border-green-200 dark:bg-green-900/30 dark:border-green-700'
              : 'bg-red-50 border-red-200 dark:bg-red-900/30 dark:border-red-700'
          }`}
        >
          <div className="flex items-start gap-4">
            {result.shouldMerge ? (
              <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-300 flex-shrink-0" />
            ) : (
              <XCircle className="w-10 h-10 text-red-600 dark:text-red-300 flex-shrink-0" />
            )}
            <div className="flex-1">
              <h2
                className={`text-2xl font-bold mb-2 ${
                  result.shouldMerge ? 'text-green-900 dark:text-green-100' : 'text-red-900 dark:text-red-100'
                }`}
              >
                {result.shouldMerge ? '✓ Ready to Merge' : '✗ Not Ready to Merge'}
              </h2>
              <p className={result.shouldMerge ? 'text-green-700 dark:text-green-200' : 'text-red-700 dark:text-red-200'}>
                {result.explanation}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="w-6 h-6 text-blue-600" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">PR Summary</h3>
              </div>
              <p className="text-slate-700 dark:text-slate-200 leading-relaxed">{result.summary}</p>

              {result.metadata && (
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <Info label="Author" value={result.metadata.author} />
                    <Info label="Files Changed" value={String(result.metadata.filesChanged)} />
                    <Info label="Additions" value={`+${result.metadata.additions}`} accent="text-green-600 dark:text-green-300" />
                    <Info label="Deletions" value={`-${result.metadata.deletions}`} accent="text-red-600 dark:text-red-300" />
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-orange-500 dark:text-orange-300" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Risk Analysis</h3>
              </div>
              <ul className="space-y-3">
                {result.risks.map((risk, index) => (
                  <li key={index} className="flex items-start gap-3 p-3 bg-orange-50 dark:bg-orange-900/30 rounded-lg transition-colors">
                    <span className="bg-orange-200 dark:bg-orange-500 text-orange-800 dark:text-orange-50 rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {index + 1}
                    </span>
                    <span className="text-slate-700 dark:text-slate-200 flex-1 pt-0.5">{risk}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 sticky top-24 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <ListChecks className="w-6 h-6 text-blue-600" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Merge Checklist</h3>
              </div>
              <div className="space-y-2">
                {checklist.map((item) => (
                  <label
                    key={item.id}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/80 cursor-pointer transition-colors group"
                  >
                    <input
                      type="checkbox"
                      defaultChecked={item.completed}
                      className="mt-1 w-5 h-5 text-blue-600 rounded border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500"
                    />
                    <span
                      className={`flex-1 ${
                        item.completed ? 'text-slate-600 dark:text-slate-300' : 'text-slate-900 dark:text-white font-medium'
                      }`}
                    >
                      {item.text}
                    </span>
                  </label>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-slate-200 space-y-3">
                <Link
                  to="/"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors text-center block"
                >
                  Analyze Another PR
                </Link>
                <button
                  onClick={() => window.print()}
                  className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-100 font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  Export Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function Info({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div>
      <span className="text-slate-500 dark:text-slate-400 block mb-1">{label}</span>
      <p className={`font-medium text-slate-900 dark:text-slate-100 ${accent || ''}`}>{value}</p>
    </div>
  )
}

