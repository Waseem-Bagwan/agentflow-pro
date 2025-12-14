import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Import the handler we want to test
import handler from '../analyze'

// Create a simple mock of VercelRequest and VercelResponse
function createReqBody(body: any) {
  return {
    method: 'POST',
    body
  } as any
}

function createRes() {
  const json = vi.fn()
  const status = vi.fn(() => ({ json }))
  return { status, json } as any
}

describe('API /api/analyze (demo)', () => {
  beforeEach(() => {
    // Ensure demo mode is enabled for these tests
    process.env.DEMO_MODE = 'true'
  })

  afterEach(() => {
    vi.restoreAllMocks()
    delete process.env.DEMO_MODE
  })

  it('returns the expected shape in demo mode', async () => {
    const req = createReqBody({ prUrl: 'https://github.com/owner/repo/pull/1', demoMode: true })
    const res = createRes()

    await handler(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    const jsonMock = res.status.mock.results[0].value.json
    expect(typeof jsonMock).toBe('function')
    const payload = jsonMock.mock.calls[0][0]
    expect(payload.summary).toBeDefined()
    expect(payload.mode).toBe('demo')
    expect(Array.isArray(payload.risks)).toBe(true)
    expect(Array.isArray(payload.checklist)).toBe(true)
  })

  it('returns a JSON error for non-POST methods', async () => {
    const req = { method: 'GET' } as any
    const res = createRes()

    await handler(req, res)

    expect(res.status).toHaveBeenCalledWith(405)
    const jsonMock = res.status.mock.results[0].value.json
    const payload = jsonMock.mock.calls[0][0]
    expect(payload.success).toBe(false)
    expect(typeof payload.error).toBe('string')
    expect(payload.error).toBe('Method not allowed')
  })

  it('falls back to mock when Kestra execution fails (no 502)', async () => {
    // Simulate live mode with GitHub and Kestra present but Kestra failing
    delete process.env.DEMO_MODE
    process.env.VITE_DEMO_MODE = 'false'
    process.env.GITHUB_TOKEN = 'token'

    const req = createReqBody({ prUrl: 'https://github.com/owner/repo/pull/1' })
    const res = createRes()

    // Mock GitHub fetch and Kestra trigger
    const github = await import('../utils/github')
    const kestra = await import('../utils/kestra')
    vi.spyOn(github, 'fetchPrData').mockResolvedValue({ title: 'Title', author: 'a', diffText: 'diff', files: [] } as any)
    vi.spyOn(kestra, 'triggerKestra').mockRejectedValue(new Error('Kestra down'))

    await handler(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    const jsonMock = res.status.mock.results[0].value.json
    const payload = jsonMock.mock.calls[0][0]
    expect(payload.mode).toBe('fallback')
    expect(payload.source).toBe('demo')
    delete process.env.GITHUB_TOKEN
    delete process.env.VITE_DEMO_MODE
  })
})
