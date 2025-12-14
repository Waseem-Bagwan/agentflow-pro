import axios from 'axios'

export interface PRFile {
  path: string
  status: string
}

export interface PRFetchResult {
  title: string
  author: string
  diffText: string
  files: PRFile[]
}

function parseGithubPrUrl(prUrl: string) {
  try {
    const url = new URL(prUrl)
    if (!url.hostname.includes('github.com')) throw new Error('Not a GitHub URL')
    const parts = url.pathname.split('/').filter(Boolean)
    // supports /owner/repo/pull/123 or /owner/repo/pulls/123
    if (parts.length < 4 || (parts[2] !== 'pull' && parts[2] !== 'pulls')) {
      throw new Error('Invalid GitHub PR path')
    }
    const [owner, repo, , prNumberRaw] = parts
    const prNumber = Number(prNumberRaw)
    if (!owner || !repo || Number.isNaN(prNumber)) throw new Error('Invalid GitHub PR URL')
    return { owner, repo, prNumber }
  } catch (err: any) {
    throw new Error(err?.message || 'Invalid GitHub PR URL')
  }
}

/**
 * Fetch PR metadata and diff from GitHub given a full PR URL.
 * If `token` is provided it will be used to authenticate requests.
 * Throws an error when no token provided (caller may fallback to demo mode).
 *
 * Note: This is a minimal implementation using axios. For production
 * you may want to replace with @octokit/rest which handles pagination
 * and rate limits more gracefully.
 */
export async function fetchPrData(prUrl: string, token?: string): Promise<PRFetchResult> {
  if (!token) {
    throw new Error('GitHub token required to fetch PR data')
  }

  const { owner, repo, prNumber } = parseGithubPrUrl(prUrl)

  const headers = {
    Authorization: `token ${token}`,
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'AgentFlow-Pro'
  }

  try {
    const base = `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}`
    console.info('[github] Fetching PR data for', { owner, repo, prNumber })
    const prResp = await axios.get(base, { headers })
    const pr = prResp.data

    const diffResp = await axios.get(base, {
      headers: { ...headers, Accept: 'application/vnd.github.v3.diff' }
    })

    const filesResp = await axios.get(`${base}/files`, { headers })
    const files: PRFile[] = (filesResp.data || []).map((f: any) => ({ path: f.filename, status: f.status }))

    return {
      title: pr.title || '',
      author: pr.user?.login || '',
      diffText: typeof diffResp.data === 'string' ? diffResp.data : '',
      files
    }
  } catch (err: any) {
    if (err.response?.status === 401 || err.response?.status === 403) {
      throw new Error('GitHub authentication failed (401/403). Check GITHUB_TOKEN.')
    }
    if (err.response?.status === 404) {
      throw new Error('Pull request not found (404).')
    }
    throw new Error(`GitHub fetch failed: ${err?.message || String(err)}`)
  }
}