import { Loader2 } from 'lucide-react'

export default function LoadingSpinner() {
  return (
    <div className="card text-center py-12">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-12 h-12 text-primary-600 animate-spin" />
        <div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">
            Analyzing Pull Request...
          </h3>
          <p className="text-slate-600">
            Our AI agents are reviewing the code changes
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <div className="flex gap-1">
            <span className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
            <span className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
            <span className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
          </div>
          <span>Processing with Kestra AI</span>
        </div>
      </div>
    </div>
  )
}