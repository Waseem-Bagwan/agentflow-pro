export default function Hero() {
  return (
    <section className="w-full">
      <div className="max-w-3xl mx-auto px-6 py-20 flex flex-col gap-10">
        <div className="flex flex-col gap-4">
          <p className="inline-flex w-fit rounded-full bg-blue-50 dark:bg-blue-900/30 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300 transition-colors">
            AgentFlow Pro
          </p>
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight text-neutral-900 dark:text-white transition-colors">
            PR reviews with <span className="bg-gradient-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400 bg-clip-text text-transparent">clarity and speed</span>
          </h1>
          <p className="text-lg text-neutral-600 dark:text-slate-300 max-w-2xl transition-colors">
            Drop in a GitHub PR and get deterministic summaries, grouped changes, risk flags, and a confident merge call — purpose-built for reviewers.
          </p>
        </div>

        {/* Input handled by page */}
      </div>
    </section>
  )
}
