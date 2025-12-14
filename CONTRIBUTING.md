# Contributing to AgentFlow Pro

Thank you for your interest in contributing! This project uses **CodeRabbit** for automated code reviews and quality assurance.

## 🤖 CodeRabbit Integration

CodeRabbit is our AI-powered code review assistant that helps maintain high code quality standards.

### What CodeRabbit Does

- ✅ **Automated PR Reviews** - Analyzes every pull request
- ✅ **Code Quality Suggestions** - Identifies improvements
- ✅ **Security Scanning** - Detects vulnerabilities
- ✅ **Documentation Checks** - Ensures proper commenting
- ✅ **Best Practices** - Enforces coding standards

### Setting Up CodeRabbit

1. **Install CodeRabbit App**:
   - Go to [CodeRabbit GitHub App](https://github.com/apps/coderabbitai)
   - Click "Install"
   - Select your repository

2. **Configure Settings**:
   Create `.coderabbit.yaml` in repository root:
   ```yaml
   language: "en-US"
   early_access: true
   reviews:
     profile: "chill"
     request_changes_workflow: false
     high_level_summary: true
     poem: false
     review_status: true
   chat:
     auto_reply: true
   ```

3. **Verify Installation**:
   - Create a test PR
   - CodeRabbit should comment within minutes

## 📋 Pull Request Process

### 1. Fork and Clone

```bash
git clone https://github.com/yourusername/agentflow-pro.git
cd agentflow-pro
git checkout -b feature/your-feature-name
```

### 2. Make Your Changes

Follow our code style:
- Use TypeScript for type safety
- Follow ESLint rules
- Write meaningful commit messages
- Add comments for complex logic

### 3. Test Locally

```bash
npm run lint
npm run type-check
npm run build
```

### 4. Create Pull Request

**PR Title Format**:
```
feat: Add new feature
fix: Fix bug in component
docs: Update documentation
refactor: Improve code structure
test: Add tests for feature
```

**PR Description Template**:
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactoring

## Testing
- [ ] Tested locally
- [ ] Added/updated tests
- [ ] All tests pass

## Screenshots (if applicable)
[Add screenshots]

## CodeRabbit Checklist
- [ ] CodeRabbit review completed
- [ ] All CodeRabbit suggestions addressed
- [ ] No security vulnerabilities found
```

### 5. Respond to CodeRabbit

When CodeRabbit reviews your PR:

1. **Read the feedback carefully**
2. **Address suggestions**:
   - Reply with changes made
   - Explain if you disagree
   - Mark conversations as resolved

3. **Request re-review** if needed

## 🎨 Code Style Guidelines

### TypeScript

```typescript
// ✅ Good: Clear types, descriptive names
interface PRAnalysisRequest {
  prUrl: string;
}

async function analyzePR(request: PRAnalysisRequest): Promise<AnalysisResult> {
  // Implementation
}

// ❌ Bad: Unclear types, vague names
function doStuff(data: any) {
  // Implementation
}
```

### React Components

```typescript
// ✅ Good: Functional component with proper types
interface ButtonProps {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}

export default function Button({ onClick, disabled, children }: ButtonProps) {
  return (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}
```

### File Structure

```
- One component per file
- Named exports for utilities
- Default exports for components
- Co-locate types with usage
```

## 🧪 Testing Guidelines

### Component Tests

```typescript
// Add tests for new components
describe('InputPanel', () => {
  it('should validate PR URL format', () => {
    // Test implementation
  });
});
```

### API Tests

```typescript
// Test API endpoints
describe('POST /api/analyze', () => {
  it('should return analysis results', async () => {
    // Test implementation
  });
});
```

## 📝 Documentation Standards

### Code Comments

```typescript
// ✅ Good: Explains WHY, not WHAT
// Delay prevents rate limiting on GitHub API
await sleep(1000);

// ❌ Bad: States the obvious
// Sleep for 1 second
await sleep(1000);
```

### README Updates

When adding features:
1. Update main README.md
2. Add to feature list
3. Update screenshots if UI changed
4. Document new environment variables

## 🔍 CodeRabbit Review Examples

### Example 1: Type Safety Suggestion

**CodeRabbit**:
> Consider adding explicit return type to improve type safety

**Response**:
```typescript
// Before
async function fetchData(url: string) {
  return await fetch(url);
}

// After
async function fetchData(url: string): Promise<Response> {
  return await fetch(url);
}
```

### Example 2: Error Handling

**CodeRabbit**:
> Add error handling for this API call

**Response**:
```typescript
// Before
const data = await api.get('/endpoint');

// After
try {
  const data = await api.get('/endpoint');
} catch (error) {
  console.error('API call failed:', error);
  throw new Error('Failed to fetch data');
}
```

## 🚀 Release Process

1. **Version Bump**:
   ```bash
   npm version patch  # 1.0.0 → 1.0.1
   npm version minor  # 1.0.0 → 1.1.0
   npm version major  # 1.0.0 → 2.0.0
   ```

2. **Update CHANGELOG.md**

3. **Create Release PR**

4. **CodeRabbit Final Review**

5. **Merge to main**

6. **Deploy to Production**

## 💡 Tips for Success

### Get CodeRabbit Approved Fast

1. **Write clear commit messages**
2. **Add comments for complex code**
3. **Follow TypeScript strict mode**
4. **Handle errors properly**
5. **Update documentation**

### Common CodeRabbit Flags

| Issue | Solution |
|-------|----------|
| Missing types | Add explicit TypeScript types |
| No error handling | Wrap in try-catch |
| Commented code | Remove or explain |
| Long functions | Refactor into smaller pieces |
| Hardcoded values | Use constants or env vars |

## 📞 Getting Help

- 💬 **Discord**: WeMakeDevs Server
- 📧 **Email**: your.email@example.com
- 🐛 **Issues**: [GitHub Issues](https://github.com/yourusername/agentflow-pro/issues)

## 🙏 Recognition

Contributors will be:
- Listed in README.md
- Mentioned in release notes
- Credited in documentation

Thank you for contributing to AgentFlow Pro! 🎉