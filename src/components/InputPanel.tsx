import { useState } from 'react'
import { Send } from 'lucide-react'

interface InputPanelProps {
  onAnalyze: (prUrl: string, demo?: boolean) => void
  isLoading: boolean
}

export default function InputPanel({ onAnalyze, isLoading }: InputPanelProps) {
  const [prUrl, setPrUrl] = useState('')
  const [useDemo, setUseDemo] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!prUrl.trim()) {
      setError('Please enter a GitHub PR URL')
      return
    }
    // Basic validation
    if (!/github\.com\/.+\/pull\/(\d+)/.test(prUrl.trim())) {
      setError('Invalid GitHub PR URL format')
      return
    }

    onAnalyze(prUrl.trim(), useDemo)
  }

  const demoUrl = 'https://github.com/example/repo/pull/1'

  return (
    <div className="card mb-8">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="pr-url" className="block text-sm font-medium text-slate-700 mb-2">
            GitHub Pull Request URL
          </label>
          <input
            id="pr-url"
            type="url"
            value={prUrl}
            onChange={(e) => setPrUrl(e.target.value)}
            placeholder="https://github.com/owner/repo/pull/123"
            className="input-field"
            required
            disabled={isLoading}
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isLoading || !prUrl.trim()}
            className="btn-primary flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            Analyze PR
          </button>

          <button
            type="button"
            onClick={() => setPrUrl(demoUrl)}
            className="text-sm text-primary-600 hover:text-primary-700 underline"
            disabled={isLoading}
          >
            Try Demo PR
          </button>
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={useDemo} onChange={(e) => setUseDemo(e.target.checked)} />
            <span>Use demo mode (local deterministic summarizer)</span>
          </label>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <p className="text-xs text-slate-500">
          ℹ️ Toggle demo to use local deterministic summarizer instead of calling external services
        </p>
      </form>
    </div>
  )
}