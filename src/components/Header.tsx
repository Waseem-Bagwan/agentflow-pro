import { GitPullRequest, Sparkles, Moon, Sun } from 'lucide-react'
import { useDarkMode } from '../hooks/useDarkMode'

export default function Header() {
  const { isDark, toggleDark } = useDarkMode()

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary-600 p-2 rounded-lg">
              <GitPullRequest className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">AgentFlow Pro</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">AI-Powered PR Review Assistant</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary-600" />
              <span className="text-slate-600 dark:text-slate-300">Powered by Kestra AI Agents</span>
            </div>
            <button
              onClick={toggleDark}
              aria-label="Toggle dark mode"
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {isDark ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}