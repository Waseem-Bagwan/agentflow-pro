import type { AnalysisResult } from '../../src/types'

export function getMockAnalysis(owner: string, repo: string, prNumber: number): AnalysisResult {
  const files = [
    'src/components/Button.tsx',
    'src/components/Header.tsx',
    'src/utils/helpers.ts',
    'tests/components/button.test.tsx',
    'tests/utils/helpers.test.ts',
    'docs/CHANGELOG.md',
    'README.md'
  ]

  return {
    title: `Demo PR #${prNumber} — Improve ${repo} internals`,
    summary: `This pull request improves core internals of the ${repo} repository by refactoring key components, adding unit tests, and updating documentation. The changes are focused and include several performance optimizations and cleanup of legacy code. Overall, the PR is well-scoped and includes test coverage for the main changes.`,
    filesGrouped: {
      code: files.filter(f => /src\//.test(f)),
      tests: files.filter(f => /tests?\//.test(f) || /\.test\./.test(f)),
      docs: files.filter(f => /docs?\//.test(f) || /README\.md/.test(f))
    },
    risks: [
      'Large refactor may introduce subtle bugs in edge cases',
      'Database migration paths need verification in staging',
      'Potential performance regressions under heavy load'
    ],
    checklist: [
      'CI checks are passing',
      'At least 1 reviewer approved',
      'Test coverage updated for changed modules',
      'Documentation updated for public APIs'
    ],
    shouldMerge: true,
    explanation: 'Based on the changes and tests provided, the PR appears safe to merge after a short final review focused on migration and performance checks.',
    lintSummary: 'No lint errors detected; 2 files with minor style warnings.',
    metadata: {
      prNumber,
      repository: `${owner}/${repo}`,
      author: 'demo-user',
      filesChanged: files.length,
      additions: 230,
      deletions: 45
    }
  }
}

export interface SummaryResult {
  summary: string
  filesGrouped: { code: string[]; tests: string[]; docs: string[] }
  risks: string[]
  checklist: string[]
  shouldMerge: boolean
  explanation: string
  lintSummary: string
}

/**
 * Deterministic summarizer that parses diff text and returns a structured
 * summary. This is a local fallback for demo or when Kestra is not available.
 */
export function mockSummarize(diffText: string): SummaryResult {
  // Extract filenames from diff headers
  const files = new Set<string>()
  const lines = (diffText || '').split('\n')
  for (const line of lines) {
    const m = line.match(/^diff --git a\/(.+?) b\//)
    if (m) files.add(m[1])
    const m2 = line.match(/^\+\+\+ b\/(.+)$/)
    if (m2) files.add(m2[1])
  }

  const fileList = Array.from(files)

  const code: string[] = []
  const tests: string[] = []
  const docs: string[] = []

  for (const f of fileList) {
    const lower = f.toLowerCase()
    if (/\.test\.|\.spec\.|^tests?\//.test(lower) || /test/.test(lower)) {
      tests.push(f)
      continue
    }
    if (/\.md$|^docs?\//.test(lower) || /readme/.test(lower)) {
      docs.push(f)
      continue
    }
    code.push(f)
  }

  // Build a 2-4 sentence summary from the first non-empty diff lines
  const nonEmpty = lines.filter(l => l.trim().length > 0)
  const firstThree = nonEmpty.slice(0, 6).join(' ')
  const summary = firstThree
    ? `This PR includes changes affecting ${fileList.length} files. ${firstThree} The changes appear focused and include updates to code, tests, and documentation.`
    : `This PR updates ${fileList.length} files across code, tests, and docs.`

  // Risk bullets heuristics
  const risks: string[] = []
  if (fileList.some(f => /migrations|schema|db|database/.test(f.toLowerCase()))) {
    risks.push('Touches database migrations — verify migration safety in staging')
  }
  if (fileList.some(f => /api|routes|controllers|public/.test(f.toLowerCase()))) {
    risks.push('Modifies public API surface — ensure backward compatibility')
  }
  if (tests.length === 0) {
    risks.push('No tests changed — consider adding/adjusting tests for new behavior')
  }
  if (risks.length === 0) {
    risks.push('No obvious high risks detected; run CI and sanity checks')
  }

  const checklist = [
    'CI builds are passing',
    'At least one reviewer approved changes',
    'Tests cover new/changed behavior',
    'Documentation updated where needed',
    'Performance and security checks completed'
  ]

  const lintSummary = 'Lint: basic checks OK (deterministic mock)'

  return {
    summary,
    filesGrouped: { code, tests, docs },
    risks,
    checklist,
    shouldMerge: risks.length <= 1,
    explanation: risks.length <= 1 ? 'Risks are manageable.' : 'Address listed risks before merging.',
    lintSummary
  }
}