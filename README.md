# AgentFlow Pro

AI-powered PR review assistant with deterministic demo mode and optional Kestra orchestration.

## Quick start

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Open `http://localhost:5173` and click **Try Demo PR** to see deterministic results. The UI posts `{ prUrl, demoMode }` to `/api/analyze`.

## Environment

`/api/analyze` reads these variables (see `.env.example`):

- `DEMO_MODE` — set to `true` to force demo outputs without credentials.
- `GITHUB_TOKEN` — GitHub PAT for live PR fetches.
- `KESTRA_API_URL`, `KESTRA_TENANT_ID`, `KESTRA_API_KEY` — optional; when set, the API triggers the Kestra flow before falling back to the deterministic mock. `KESTRA_API_URL` should point to your Kestra instance (e.g., `http://localhost:8080`). The API will attempt both the modern `/api/v1/namespaces/{namespace}/flows/{flowId}/executions` endpoint and the legacy `/main/executions/{namespace}/{flowId}` endpoint.

## How analysis works

1. `demoMode: true` or `DEMO_MODE=true` → returns mock analysis built from `examples/sample-pr-1.md` + `getMockAnalysis`.
2. Otherwise, with `GITHUB_TOKEN`:
   - Fetch PR metadata/diff via GitHub REST.
   - If Kestra envs are present, POST the diff to `${apiUrl}/api/v1/namespaces/{tenantId}/flows/pr-analyzer/executions` (see `api/utils/kestra.ts`; replace the placeholder flow id). Polls until success or returns the latest output.
   - If Kestra fails or is absent, fall back to `mockSummarize` and respond with note `"Agent error — using fallback summary"`.
3. Response shape always includes `summary`, `filesGrouped`, `risks`, `checklist`, `shouldMerge`, `explanation`, `lintSummary`, plus `mode` and optional `note`.

## Running checks

```bash
npm run build
npm test
```

CI (`.github/workflows/ci.yml`) runs `npm ci`, `npm test`, and `npm run build`.

## Demo vs live usage

- **Demo**: Click **Try Demo PR** in the UI or send `{ demoMode: true }`. The app shows a “Demo mode — deterministic sample results” badge.
- **Live**: Provide `GITHUB_TOKEN` and a PR URL. If Kestra is configured, its output is mapped to the AnalysisResult shape; otherwise the local mock summarizer is used.
 
**Production note:** To force demo-only behavior in production (recommended for deployments where Kestra or GitHub access isn't available), set `VITE_DEMO_MODE=true` in your Vercel environment variables (or add it to your `.env` for local dev). When enabled the frontend forces demo mode and no Kestra or GitHub calls will be made.

## 🤖 CodeRabbit Integration

This project uses **CodeRabbit** for automated code reviews and quality assurance.

### Features
- ✅ Automated PR reviews
- ✅ Code quality suggestions
- ✅ Security vulnerability detection
- ✅ Documentation improvements
- ✅ Best practices enforcement

### How It Works
CodeRabbit automatically reviews every pull request, providing:
- Line-by-line code analysis
- Suggestions for improvements
- Security and performance insights
- Documentation quality checks
- Automatic reviews are posted as comments directly on GitHub pull requests.

## 🤖 CodeRabbit Code Quality Workflow

This project actively uses **CodeRabbit** as part of its pull request review process.

- Every PR is automatically reviewed by CodeRabbit
- Inline suggestions are addressed and applied
- Reviews are treated as a required quality gate

📸 **Evidence:**  
See `docs/screenshots/` for real CodeRabbit PR reviews, suggestions, and follow-up fixes.

## Kestra setup (optional)

`api/utils/kestra.ts` documents the execution endpoint pattern. Replace the `flowId` placeholder (`pr-analyzer`) with your deployed flow id. Demo tenants (`demo.kestra.io`) return deterministic mock data.

### Kestra Integration

- Kestra runs externally (recommended via Docker Compose). Do NOT add Kestra's compose files to this repo — run it outside this project.
- Required environment variables (example `.env` entries):

   - `GITHUB_TOKEN=`
   - `KESTRA_API_URL=http://localhost:8080`
   - `KESTRA_TENANT_ID=agentflow`
   - `KESTRA_FLOW_ID=pr-review-agent`
   - `KESTRA_API_KEY=`
   - `KESTRA_FALLBACK_ON_ERROR=true` — optional. When `true` (default), the backend falls back to deterministic mock if Kestra fails. The handler is designed to avoid returning gateway errors (502) and will gracefully fall back to the deterministic mock so deployments remain reliable.
   - `SECRET_OPENAI_API_KEY=` (Base64-encoded secret injected into Kestra as `SECRET_OPENAI_API_KEY`)

### Running Kestra with Docker Compose (example)

Create a separate `docker-compose.yml` (outside this repo) and include Kestra images plus your plugins. Example snippet:

```yaml
version: '3.8'
services:
   kestra:
      image: kestrahq/kestra:latest
      ports:
         - 8080:8080
      environment:
         SECRET_OPENAI_API_KEY: ${SECRET_OPENAI_API_KEY}
         KESTRA_FLOW_STORAGE: local
      volumes:
         - ./flows:/app/flows
```

Store secrets as Base64-encoded variables prefixed with `SECRET_` when adding to your compose or environment. Kestra will expose them to flows as configured.

### Importing the flow

1. Copy `kestra/pr-review-agent.yml` into your Kestra `flows/` folder or import via Kestra UI.
2. Ensure the flow `namespace` and `id` match the env vars (`KESTRA_TENANT_ID` and `KESTRA_FLOW_ID`).

### Triggering the flow manually (example)

```bash
curl -X POST "${KESTRA_API_URL}/main/executions/${KESTRA_TENANT_ID}/${KESTRA_FLOW_ID}?wait=true" \
   -H "Authorization: ApiKey ${KESTRA_API_KEY}" \
   -F prNumber=1 \
   -F repository=owner/repo \
   -F prTitle="Add example" \
   -F prDiff="diff contents here"
```

### Env var notes

- Kestra secrets should be provided via your deployment method (Docker Compose, Kubernetes, etc.) and may be Base64-encoded if you prefer. Prefix secret environment names with `SECRET_` to indicate they are secret values consumed by Kestra flows.
- The backend will only send the `Authorization` header to Kestra when `KESTRA_API_KEY` is present.


## Project structure

- `src/` — React frontend (InputBar, Hero, Steps, ResultsPanel).
- `api/` — Vercel serverless entry `/api/analyze` plus helpers (`github`, `kestra`, `mock`).
- `examples/` — sample PR content for demo mode.
- `tests/` — Vitest coverage for demo and live branches.

## Useful commands

- `npm run dev` — start Vite dev server.
- `npm run build` — type-check + bundle.
- `npm test` — Vitest suite (mocks GitHub/Kestra).