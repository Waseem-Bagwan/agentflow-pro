import type { VercelRequest, VercelResponse } from '@vercel/node'

export default function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    return res.status(200).json({
      success: true,
      status: 'ok',
      kestraEnabled: Boolean(process.env.KESTRA_API_URL),
      githubToken: Boolean(process.env.GITHUB_TOKEN)
    })
  } catch (err: any) {
    console.error('[health] Error building health response', err)
    return res.status(500).json({ success: false, error: 'Health check failed', source: 'server' })
  }
}
