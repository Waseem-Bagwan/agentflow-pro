# Kestra AI Workflow Setup

This directory contains the Kestra workflow configuration for AgentFlow Pro's AI-powered PR review agent.

## What This Workflow Does

The `agentflow.yml` workflow demonstrates **Kestra's AI Agent capabilities**:

1. **Data Summarization** ✓ - Aggregates PR metadata, diff, and statistics
2. **AI-Powered Decision Making** ✓ - Uses OpenAI to analyze code and make merge recommendations
3. **Structured Output** ✓ - Returns JSON with summary, risks, and checklist

This fulfills the **Wakanda Data Award** requirements by using Kestra's AI capabilities to summarize data from GitHub and make intelligent decisions.

## Setup Instructions

### Option 1: Local Kestra Setup

1. **Install Kestra**:
```bash
docker run --rm -p 8080:8080 kestra/kestra:latest
```

2. **Access Kestra UI**:
Open http://localhost:8080 in your browser

3. **Create the Workflow**:
- Go to "Flows" → "Create"
- Copy the contents of `agentflow.yml`
- Paste and save

4. **Add Secret**:
- Go to "Settings" → "Secrets"
- Add: `OPENAI_API_KEY` with your OpenAI key

5. **Test the Workflow**:
- Go to your flow
- Click "Execute"
- Fill in test inputs
- View results

### Option 2: Kestra Cloud

1. **Sign up**: https://demo.kestra.io
2. **Create namespace**: `agentflow`
3. **Upload workflow**: Copy `agentflow.yml` content
4. **Configure secrets**: Add your OpenAI API key
5. **Test execution**: Run with sample PR data

## Workflow Structure

```yaml
Inputs → Prepare Context → AI Analysis → Parse Response → Generate Report → Outputs
```

### Key Components

1. **prepare_analysis_context**: Structures PR data for analysis
2. **ai_pr_analysis**: OpenAI GPT-4 analyzes the PR
3. **parse_ai_response**: Validates and formats AI output
4. **generate_summary_report**: Creates decision summary with confidence scoring

## Testing the Workflow

### Manual Test via Kestra UI

```json
{
  "prNumber": 123,
  "prTitle": "Add user authentication",
  "prBody": "Implements JWT-based auth",
  "prDiff": "diff --git a/auth.js...",
  "repository": "company/app",
  "author": "developer",
  "filesChanged": 5,
  "additions": 200,
  "deletions": 50
}
```

### API Test via cURL

```bash
curl -X POST http://localhost:8080/api/v1/executions/agentflow/pr-review-agent \
  -H "Content-Type: application/json" \
  -d '{
    "inputs": {
      "prNumber": 123,
      "prTitle": "Test PR",
      "repository": "test/repo"
    }
  }'
```

## Expected Output Format

```json
{
  "summary": "This PR adds user authentication...",
  "risks": [
    "Security implications need review",
    "Database schema changes"
  ],
  "shouldMerge": true,
  "explanation": "Well-tested with good coverage",
  "checklist": [
    {"id": "1", "text": "All tests passing", "completed": true}
  ]
}
```

## Troubleshooting

**Error: OpenAI API Key Missing**
- Add `OPENAI_API_KEY` in Kestra secrets

**Error: Workflow Not Found**
- Ensure namespace is `agentflow`
- Check flow ID is `pr-review-agent`

**Error: Execution Timeout**
- Increase timeout in workflow config
- Check OpenAI API rate limits

## Prize Eligibility Note

This workflow qualifies for the **Wakanda Data Award ($4,000)** because it:
- ✅ Uses Kestra's AI Agent (OpenAI ChatCompletion task)
- ✅ Summarizes data from multiple sources (PR metadata, diff, stats)
- ✅ Makes decisions based on analysis (shouldMerge boolean)
- ✅ Produces structured JSON output

The workflow demonstrates real-world data orchestration and AI-powered decision-making using Kestra's platform.