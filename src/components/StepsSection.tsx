import { Cpu, Search, CheckCircle } from 'lucide-react'

export default function StepsSection() {
  const steps = [
    { id: 1, Icon: Search, title: 'Paste PR URL', desc: 'Supports public GitHub PR links' },
    { id: 2, Icon: Cpu, title: 'AI analyzes code & risks', desc: 'Deterministic demo or live Kestra flow' },
    { id: 3, Icon: CheckCircle, title: 'Get merge decision', desc: 'Clear summary, risks, and checklist' }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {steps.map((s) => (
        <div key={s.id} className="flex items-start gap-3 rounded-md border border-neutral-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 shadow-sm transition-colors">
          <div className="mt-0.5 rounded-md bg-blue-50 dark:bg-blue-900/30 p-2 text-blue-700 dark:text-blue-300 transition-colors">
            <s.Icon className="w-4 h-4" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <div className="text-sm font-semibold text-neutral-900 dark:text-slate-100 transition-colors">{s.title}</div>
            <p className="text-xs text-neutral-600 dark:text-slate-400 transition-colors">{s.desc}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
