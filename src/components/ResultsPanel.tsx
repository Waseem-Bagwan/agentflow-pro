import { CheckCircle2, XCircle, AlertTriangle, FileText, ListChecks } from 'lucide-react'
import { AnalysisResult } from '../types'

interface ResultsPanelProps {
  result: AnalysisResult
}

export default function ResultsPanel({ result }: ResultsPanelProps) {
  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="card">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">{result.title || 'Pull Request Analysis'}</h2>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-1 rounded-full ${result.source === 'kestra' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'} border`}>{result.source === 'kestra' ? 'Live Kestra Analysis' : result.mode === 'demo' ? 'Demo' : (result.source || 'Direct')}</span>
            {result.mode === 'fallback' && (
              <span className="text-xs text-amber-700 dark:text-amber-200">Fallback to mock</span>
            )}
          </div>
        </div>
      </div>

      {/* Summary (2-4 sentences) */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <FileText className="w-6 h-6 text-primary-600" />
          <h3 className="text-xl font-bold text-slate-900">Summary</h3>
        </div>
        <p className="text-slate-700 leading-relaxed">{result.summary}</p>
      </div>

      {/* Files grouped: code / tests / docs */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <FileText className="w-6 h-6 text-primary-600" />
          <h3 className="text-xl font-bold text-slate-900">Files Changed</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h4 className="text-sm font-semibold text-slate-700 mb-2">Code</h4>
            <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1">
              {result.filesGrouped.code.map((f) => <li key={f}>{f}</li>)}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-700 mb-2">Tests</h4>
            <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1">
              {result.filesGrouped.tests.map((f) => <li key={f}>{f}</li>)}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-700 mb-2">Docs</h4>
            <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1">
              {result.filesGrouped.docs.map((f) => <li key={f}>{f}</li>)}
            </ul>
          </div>
        </div>
      </div>

      {/* Risks */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="w-6 h-6 text-orange-600" />
          <h3 className="text-xl font-bold text-slate-900">Risks</h3>
        </div>
        <ul className="list-disc pl-5 text-slate-700 space-y-2">
          {result.risks.map((r, i) => <li key={i}>{r}</li>)}
        </ul>
      </div>

      {/* Merge checklist (numbered) */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <ListChecks className="w-6 h-6 text-primary-600" />
          <h3 className="text-xl font-bold text-slate-900">Merge Checklist</h3>
        </div>
        <ol className="list-decimal pl-5 text-slate-700 space-y-2">
          {result.checklist.map((c, i) => <li key={i}>{c}</li>)}
        </ol>
      </div>

      {/* Lint/test summary box */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <FileText className="w-6 h-6 text-primary-600" />
          <h3 className="text-xl font-bold text-slate-900">Lint / Test Summary</h3>
        </div>
        <pre className="whitespace-pre-wrap text-sm text-slate-700">{result.lintSummary}</pre>
      </div>

      {/* Merge Decision Banner at bottom */}
      <div className={`card ${result.shouldMerge ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
        <div className="flex items-start gap-4">
          {result.shouldMerge ? (
            <CheckCircle2 className="w-8 h-8 text-green-600 flex-shrink-0" />
          ) : (
            <XCircle className="w-8 h-8 text-red-600 flex-shrink-0" />
          )}
          <div className="flex-1">
            <h3 className={`text-xl font-bold mb-2 ${result.shouldMerge ? 'text-green-900' : 'text-red-900'}`}>
              {result.shouldMerge ? 'Ready to Merge ✓' : 'Not Ready to Merge ✗'}
            </h3>
            <p className={result.shouldMerge ? 'text-green-700' : 'text-red-700'}>
              {result.explanation}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}