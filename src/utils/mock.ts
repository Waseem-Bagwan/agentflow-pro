import type { AnalysisResult } from '../types'

export function getMockAnalysis(owner: string, repo: string, prNumber: number = 1): AnalysisResult {
  return {
    title: `Demo PR #${prNumber} — ${repo}`,
    summary: `This pull request introduces significant improvements to the ${repo} codebase. The changes focus on refactoring core components, adding comprehensive test coverage, and optimizing performance. The author has addressed technical debt while maintaining backward compatibility.`,
    filesGrouped: {
      code: ['src/core/index.ts', 'src/components/Dashboard.tsx'],
      tests: ['tests/core/index.test.ts', 'tests/components/Dashboard.test.tsx'],
      docs: ['README.md', 'docs/changelog.md']
    },
    risks: [
      'Large diff size may indicate complex changes that need thorough review',
      'Database schema modifications require careful migration testing',
      'Breaking API changes could affect downstream consumers',
      'Performance implications on high-traffic endpoints need load testing',
      'Security considerations around authentication flow changes'
    ],
    shouldMerge: true,
    explanation:
      'The PR demonstrates solid engineering practices with clear documentation, comprehensive tests, and proper error handling. While there are some risks to consider, they are well-documented and have mitigation strategies in place.',
    checklist: [
      'All CI/CD checks passing',
      'Code review completed by at least 2 reviewers',
      'Test coverage meets minimum threshold (80%)',
      'Documentation updated for new features',
      'Database migrations tested in staging',
      'Security scan completed with no critical issues',
      'Performance benchmarks show no regression',
      'Breaking changes communicated to stakeholders'
    ],
    lintSummary: 'Lint clean; 0 errors, 0 warnings.',
    metadata: {
      prNumber,
      repository: `${owner}/${repo}`,
      author: 'demo-user',
      filesChanged: 24,
      additions: 847,
      deletions: 312
    }
  }
}

