import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('../api/utils/github', () => ({
  fetchPrData: vi.fn()
}))
vi.mock('../api/utils/kestra', () => ({
  triggerKestra: vi.fn()
}))

import { fetchPrData } from '../api/utils/github'
import { triggerKestra } from '../api/utils/kestra'
import handler from '../api/analyze'

function makeReq(body: any) {
  return { method: 'POST', body } as any
}

function makeRes() {
  const json = vi.fn()
  const status = vi.fn(() => ({ json }))
  return { status, json } as any
}

describe('api/analyze handler', () => {
  beforeEach(() => {
    process.env.DEMO_MODE = 'false'
    process.env.GITHUB_TOKEN = 'fake-token'
    process.env.KESTRA_API_URL = 'https://kestra.local'
    process.env.KESTRA_API_KEY = 'key'
    process.env.KESTRA_TENANT_ID = 'tenant'
    process.env.KESTRA_FLOW_ID = 'pr-review-agent'
  })

  afterEach(() => {
    vi.restoreAllMocks()
    delete process.env.DEMO_MODE
    delete process.env.GITHUB_TOKEN
    delete process.env.KESTRA_API_URL
    delete process.env.KESTRA_API_KEY
    delete process.env.KESTRA_TENANT_ID
    delete process.env.KESTRA_FLOW_ID
  })

  it('uses Kestra when configured and returns live mode payload', async () => {
    const fakeDiff = 'diff --git a/src/foo.ts b/src/foo.ts\n+++ b/src/foo.ts\n@@\n+console.log(1)\n'
    ;(fetchPrData as any).mockResolvedValue({
      title: 'Add foo',
      author: 'alice',
      diffText: fakeDiff,
      files: [{ path: 'src/foo.ts', status: 'modified' }]
    })

    const kestraResult = {
      title: 'Kestra result',
      summary: 'Short summary',
      filesGrouped: { code: ['src/foo.ts'], tests: [], docs: [] },
      risks: ['risk1'],
      checklist: ['item1'],
      shouldMerge: true,
      explanation: 'All good',
      lintSummary: 'lint ok'
    }

    ;(triggerKestra as any).mockResolvedValue(kestraResult)

    const req = makeReq({ prUrl: 'https://github.com/owner/repo/pull/1' })
    const res = makeRes()

    await handler(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    const jsonPayload = res.status.mock.results[0].value.json.mock.calls[0][0]
    expect(jsonPayload.summary).toBe(kestraResult.summary)
    expect(jsonPayload.mode).toBe('live')
    expect(jsonPayload.filesGrouped.code).toContain('src/foo.ts')
    expect(jsonPayload.source).toBe('kestra')
  })

  it('falls back to mock summary when Kestra throws and sets note', async () => {
    const fakeDiff = 'diff --git a/src/bar.ts b/src/bar.ts\n+++ b/src/bar.ts\n@@\n+console.log(2)\n'
    ;(fetchPrData as any).mockResolvedValue({
      title: 'Add bar',
      author: 'bob',
      diffText: fakeDiff,
      files: [{ path: 'src/bar.ts', status: 'modified' }]
    })

    ;(triggerKestra as any).mockRejectedValue(new Error('Kestra down'))

    const req = makeReq({ prUrl: 'https://github.com/owner/repo/pull/2' })
    const res = makeRes()

    await handler(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    const jsonPayload = res.status.mock.results[0].value.json.mock.calls[0][0]
    expect(jsonPayload.mode).toBe('fallback')
    expect(jsonPayload.note).toBeDefined()
    expect(jsonPayload.filesGrouped).toBeDefined()
    expect(typeof jsonPayload.shouldMerge).toBe('boolean')
    expect(jsonPayload.source).toBe('demo')
  })

  it('returns a JSON error when GitHub fetch fails', async () => {
    ;(fetchPrData as any).mockRejectedValue(new Error('GitHub rate limit'))

    const req = makeReq({ prUrl: 'https://github.com/owner/repo/pull/3' })
    const res = makeRes()

    await handler(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
    const jsonPayload = res.status.mock.results[0].value.json.mock.calls[0][0]
    expect(jsonPayload.success).toBe(false)
    expect(typeof jsonPayload.error).toBe('string')
    expect(jsonPayload.error).toContain('Failed to fetch GitHub PR')
    expect(jsonPayload.source).toBe('github')
  })
})
