import React, { useState } from 'react'
import { Send } from 'lucide-react'

interface InputCardProps {
  onAnalyze: (prUrl: string, demo?: boolean) => void
  isLoading: boolean
  demoDefault?: boolean
}

export default function InputCard({ onAnalyze, isLoading, demoDefault = true }: InputCardProps) {
  const [prUrl, setPrUrl] = useState('')
  const [useDemo, setUseDemo] = useState(demoDefault)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setError(null)
    if (!prUrl.trim()) {
      setError('Please enter a GitHub PR URL')
      return
    }
    if (!/github\.com\/.+\/pull\/(\d+)/.test(prUrl.trim()) && !useDemo) {
      setError('Invalid GitHub PR URL format')
      return
    }
    onAnalyze(prUrl.trim(), useDemo)
  }

  const demoExample = 'https://github.com/example/repo/pull/1'

  return (
    <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl shadow-md p-6">
      <form onSubmit={handleSubmit} className="space-y-3">
        <label className="block text-sm font-medium text-slate-700">GitHub Pull Request URL</label>

        <div className="flex gap-3">
          <input
            type="url"
            value={prUrl}
            onChange={(e) => setPrUrl(e.target.value)}
            placeholder="https://github.com/owner/repo/pull/123"
            className="flex-1 px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-300"
            disabled={isLoading}
          />

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-sky-500 text-white font-semibold shadow-md hover:opacity-95 transition-opacity"
          >
            <Send className="w-4 h-4" />
            <span>Analyze PR</span>
          </button>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div>
            <button
              type="button"
              className="text-sky-600 hover:underline"
              onClick={() => {
                setPrUrl(demoExample)
                setUseDemo(true)
                // Run demo immediately
                onAnalyze(demoExample, true)
              }}
            >
              Try Demo PR
            </button>
          </div>

          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={useDemo} onChange={(e) => setUseDemo(e.target.checked)} />
            <span className="text-slate-600">Use demo mode</span>
          </label>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        {/* Demo note */}
        {useDemo && (
          <p className="text-xs text-slate-500">Demo mode enabled — deterministic sample analysis will be used.</p>
        )}
      </form>
    </div>
  )
}
