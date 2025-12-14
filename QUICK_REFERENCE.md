# AgentFlow Pro - Quick Reference Guide

**Copy-paste commands and configs for rapid development**

---

## 🚀 Installation Commands

```bash
# Clone and setup
git clone https://github.com/yourusername/agentflow-pro.git
cd agentflow-pro
npm install

# Environment setup
cp .env.example .env
# Edit .env and set VITE_DEMO_MODE=true

# Start development
npm run dev
```

---

## 🔧 NPM Scripts

```bash
npm run dev          # Start dev server (port 3000)
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # Check TypeScript types
```

---

## 🌐 Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy (development)
vercel

# Deploy (production)
vercel --prod

# View logs
vercel logs <deployment-url>
```

### Vercel Environment Variables
```
VITE_DEMO_MODE=true
GITHUB_TOKEN=ghp_xxxxx
KESTRA_API_URL=https://demo.kestra.io/api/v1
KESTRA_TENANT_ID=your_tenant
KESTRA_API_KEY=your_key
OPENAI_API_KEY=sk-xxxxx
```

---

## 🐳 Kestra Setup

```bash
# Run Kestra locally
docker run --rm -p 8080:8080 kestra/kestra:latest

# Access UI
open http://localhost:8080

# Stop Kestra
docker stop $(docker ps -q --filter ancestor=kestra/kestra:latest)
```

### Kestra Workflow Commands
```bash
# Create namespace via API
curl -X POST http://localhost:8080/api/v1/namespaces \
  -H "Content-Type: application/json" \
  -d '{"namespace": "agentflow"}'

# Trigger workflow
curl -X POST http://localhost:8080/api/v1/executions/agentflow/pr-review-agent \
  -H "Content-Type: application/json" \
  -d '{"inputs": {"prNumber": 123}}'
```

---

## 🐙 Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature

# Commit with conventional commits
git commit -m "feat: add new feature"
git commit -m "fix: resolve bug"
git commit -m "docs: update readme"

# Push and create PR
git push origin feature/your-feature
```

### Conventional Commit Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance

---

## 🤖 CodeRabbit Setup

```bash
# Install CodeRabbit GitHub App
# Visit: https://github.com/apps/coderabbitai

# Create .coderabbit.yaml
cat > .coderabbit.yaml << EOF
language: "en-US"
reviews:
  profile: "chill"
  high_level_summary: true
chat:
  auto_reply: true
EOF
```

---

## 🧪 Testing Demo Mode

### Test URLs
```
https://github.com/facebook/react/pull/28226
https://github.com/vercel/next.js/pull/50000
https://github.com/microsoft/vscode/pull/100000
```

### Expected Response Time
- Demo mode: 1-2 seconds
- Production mode: 5-10 seconds (with Kestra)

---

## 📁 Key File Locations

```
src/App.tsx                   # Main app component
src/components/               # All UI components
api/analyze.ts                # Main API endpoint
api/utils/mock.ts             # Demo mode data
kestra/agentflow.yml          # Kestra workflow
.env                          # Environment variables (create from .env.example)
```

---

## 🔍 Debugging Commands

```bash
# Check TypeScript errors
npm run type-check

# Check for linting issues
npm run lint

# Fix auto-fixable lint issues
npm run lint -- --fix

# View Vercel function logs
vercel logs --follow

# Test API locally
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"prUrl": "https://github.com/owner/repo/pull/123"}'
```

---

## 🚨 Common Error Fixes

### Error: "Module not found"
```bash
rm -rf node_modules package-lock.json
npm install
```

### Error: "Port 3000 already in use"
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
# Or use different port
npm run dev -- --port 3001
```

### Error: "Vercel deployment failed"
```bash
# Check build locally first
npm run build
# If successful, try deploying again
vercel --prod
```

### Error: "Kestra connection refused"
```bash
# Restart Kestra container
docker restart $(docker ps -q --filter ancestor=kestra/kestra:latest)
```

---

## 📊 Project Stats

```bash
# Count lines of code
find src -name "*.tsx" -o -name "*.ts" | xargs wc -l

# Count components
ls -1 src/components | wc -l

# Check bundle size
npm run build && du -sh dist
```

---

## 🎥 Recording Demo Video

```bash
# Using OBS Studio (recommended)
# 1. Set canvas to 1920x1080
# 2. Add browser source: http://localhost:3000
# 3. Add audio input source
# 4. Record to MP4

# Using macOS built-in
# Cmd+Shift+5 → Record Selected Portion

# Using Windows
# Windows+G → Record screen
```

---

## 📝 Submission Checklist

```bash
# Verify all required files exist
ls README.md CONTRIBUTING.md .env.example kestra/agentflow.yml

# Check for sensitive data
grep -r "sk-" .
grep -r "ghp_" .
grep -r "password" .

# Ensure .gitignore is working
git status  # Should not show .env or node_modules

# Final commit before submission
git add .
git commit -m "chore: final submission for AssembleHack25"
git push origin main
```

---

## 🔗 Important Links

### Documentation
- React: https://react.dev
- TypeScript: https://typescriptlang.org
- Tailwind: https://tailwindcss.com
- Vercel: https://vercel.com/docs
- Kestra: https://kestra.io/docs

### Tools
- Vercel Dashboard: https://vercel.com/dashboard
- Kestra Cloud: https://demo.kestra.io
- CodeRabbit: https://coderabbit.ai
- GitHub: https://github.com

### Support
- WeMakeDevs Discord: https://discord.gg/wemakedevs
- Hackathon Rules: https://wemakedevs.org/hackathons/assemblehack25/rules

---

## 💡 Pro Tips

1. **Always test locally before deploying**
2. **Keep demo mode enabled until everything works**
3. **Commit often with meaningful messages**
4. **Document as you build, not at the end**
5. **Ask for help early if stuck**

---

## 🎯 Day-of-Submission Checklist

- [ ] App works on Vercel
- [ ] Demo video uploaded to YouTube
- [ ] GitHub repo is public
- [ ] README has live URLs
- [ ] All code committed
- [ ] Kestra workflow tested
- [ ] CodeRabbit activity visible
- [ ] Submission form filled
- [ ] Celebrate! 🎉

---

**Need help? Check BUILD_PLAN.md for detailed daily tasks!**