import { useState } from 'react'
import { Loader2, Send } from 'lucide-react'

interface InputBarProps {
  onAnalyze: (prUrl: string, demoMode?: boolean) => Promise<void> | void
  isLoading: boolean
  error?: string | null
}

export default function InputBar({ onAnalyze, isLoading, error }: InputBarProps) {
  const [prUrl, setPrUrl] = useState('')
  const demoUrl = 'https://github.com/example/repo/pull/1'

  const submit = async () => {
    const urlToUse = prUrl.trim() || demoUrl
    await onAnalyze(urlToUse, false)
  }

  const handleDemo = async () => {
    setPrUrl(demoUrl)
    await onAnalyze(demoUrl, true)
  }

 

  return (
    <div className="w-full space-y-3">
      <label htmlFor="pr-url" className="text-sm font-medium text-neutral-800 dark:text-slate-100">
        GitHub URL (repo or PR)
      </label>
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center">
        <div className="flex-1 flex items-center rounded-lg border border-neutral-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-blue-500/40 transition-colors">
          <input
            id="pr-url"
            type="url"
            aria-label="GitHub URL"
            value={prUrl}
            onChange={(e) => setPrUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                submit()
              }
            }}
            placeholder="https://github.com/owner/repo[/pull/123]"
            className="flex-1 px-2 py-2 text-sm text-neutral-900 dark:text-slate-100 placeholder:text-neutral-400 dark:placeholder:text-slate-500 bg-transparent focus:outline-none"
          />
          <div className="flex items-center gap-3 pl-3 border-l border-neutral-200 dark:border-slate-700">
            <button
              onClick={submit}
              aria-label="Analyze pull request"
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:from-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {isLoading ? 'Analyzing' : 'Analyze'}
            </button>
          </div>
        </div>

        <button
          onClick={handleDemo}
          aria-label="Try demo pull request"
          className="inline-flex items-center justify-center rounded-md border border-neutral-200 dark:border-slate-700 px-4 py-2 text-sm font-semibold text-neutral-800 dark:text-slate-100 shadow-sm transition-colors hover:border-neutral-300 dark:hover:border-slate-600 hover:bg-neutral-50 dark:hover:bg-slate-800"
        >
          Try Demo PR
        </button>
      </div>

      {error && (
        <div className="rounded-md border border-rose-200 dark:border-rose-400/40 bg-rose-50 dark:bg-rose-900/40 px-3 py-2 text-sm text-rose-700 dark:text-rose-100 transition-colors">
          {error}
        </div>
      )}
    </div>
  )
}
