import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('axios')
import axios from 'axios'
import { triggerKestra } from '../api/utils/kestra'

describe('triggerKestra util', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('parses successful Kestra response into AnalysisResult', async () => {
    const fakeOutputs = {
      summary: 'ok',
      filesGrouped: { code: ['src/a.ts'], tests: [], docs: [] },
      risks: ['r1'],
      checklist: ['c1'],
      shouldMerge: true,
      explanation: 'explain',
      lintSummary: 'lint'
    }

    ;(axios.post as any).mockResolvedValue({ data: { id: 'exec-1' } })
    ;(axios.get as any).mockResolvedValue({ data: { state: { current: 'SUCCESS' }, outputs: fakeOutputs } })

    const res = await triggerKestra({ prNumber: 1, repository: 'owner/repo' }, { apiUrl: 'http://kestra', tenantId: 'agentflow', flowId: 'pr-review-agent' })

    expect(res.summary).toBe('ok')
    expect(res.filesGrouped.code).toContain('src/a.ts')
    expect(res.source).toBe('kestra')
  })

  it('throws descriptive error on 404', async () => {
    const err: any = new Error('not found')
    err.response = { status: 404 }
    ;(axios.post as any).mockRejectedValue(err)

    await expect(triggerKestra({ prNumber: 2, repository: 'owner/repo' }, { apiUrl: 'http://kestra', tenantId: 'agentflow', flowId: 'pr-review-agent' })).rejects.toThrow(/not found|404/)
  })
})
