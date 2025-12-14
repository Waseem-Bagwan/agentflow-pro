import { AlertCircle, X } from 'lucide-react'

interface ErrorDisplayProps {
  message: string
  onDismiss: () => void
}

export default function ErrorDisplay({ message, onDismiss }: ErrorDisplayProps) {
  return (
    <div className="card bg-red-50 border-red-200 mb-6">
      <div className="flex items-start gap-4">
        <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-lg font-bold text-red-900 mb-1">Analysis Failed</h3>
          <p className="text-red-700">{message}</p>
        </div>
        <button
          onClick={onDismiss}
          className="text-red-600 hover:text-red-700 transition"
          aria-label="Dismiss error"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}