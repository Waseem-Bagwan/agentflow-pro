# Sample Pull Request Examples

Use these for testing AgentFlow Pro and demonstrating CodeRabbit integration.

---

## Sample PR #1: Feature Addition

### PR Title
`feat: Add user authentication with JWT tokens`

### PR Description
```markdown
## Summary
Implements JWT-based authentication system for user login and registration.

## Changes
- Added JWT token generation and validation
- Created login/register endpoints
- Implemented password hashing with bcrypt
- Added auth middleware for protected routes
- Updated user model with password field

## Testing
- ✅ Unit tests for auth utilities
- ✅ Integration tests for login/register
- ✅ Manual testing with Postman
- ✅ Security audit passed

## Breaking Changes
None - this is a new feature

## Dependencies Added
- jsonwebtoken: ^9.0.0
- bcryptjs: ^2.4.3

## Screenshots
[Add login page screenshot]

## Checklist
- [x] Code follows style guidelines
- [x] Tests added and passing
- [x] Documentation updated
- [x] No security vulnerabilities
- [ ] Reviewed by security team
```

### Mock Diff
```diff
diff --git a/src/auth/jwt.ts b/src/auth/jwt.ts
new file mode 100644
index 0000000..abc1234
--- /dev/null
+++ b/src/auth/jwt.ts
@@ -0,0 +1,25 @@
+import jwt from 'jsonwebtoken';
+
+const JWT_SECRET = process.env.JWT_SECRET || 'secret';
+
+export function generateToken(userId: string): string {
+  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
+}
+
+export function verifyToken(token: string): { userId: string } {
+  return jwt.verify(token, JWT_SECRET) as { userId: string };
+}

diff --git a/src/routes/auth.ts b/src/routes/auth.ts
new file mode 100644
index 0000000..def5678
--- /dev/null
+++ b/src/routes/auth.ts
@@ -0,0 +1,40 @@
+import express from 'express';
+import bcrypt from 'bcryptjs';
+import { generateToken } from '../auth/jwt';
+
+const router = express.Router();
+
+router.post('/login', async (req, res) => {
+  const { email, password } = req.body;
+  // Login logic
+});
```

### Expected Analysis
- **Summary**: Adds JWT authentication with secure password hashing
- **Risks**: 
  - JWT secret management needs review
  - Rate limiting on login endpoints
  - Password policy enforcement
- **Should Merge**: Yes (with minor concerns)
- **Checklist**: Security review, rate limiting, env var documentation

---

## Sample PR #2: Bug Fix

### PR Title
`fix: Resolve memory leak in data processing pipeline`

### PR Description
```markdown
## Problem
Memory usage grows unbounded when processing large datasets, eventually causing application crashes.

## Root Cause
Event listeners were not being properly cleaned up after data processing completed.

## Solution
- Added explicit cleanup in finally blocks
- Implemented proper event listener removal
- Added memory usage monitoring
- Reduced batch size for large datasets

## Impact
- Memory usage stays constant under load
- No more crashes during peak traffic
- Processing time slightly increased (5%) but acceptable tradeoff

## Testing
- Load tested with 10GB dataset
- Monitored memory over 24 hours
- No memory leaks detected
- All existing tests pass

## Metrics
Before: Memory grows from 200MB → 8GB over 1 hour
After: Memory stays stable at 200-300MB

## Related Issues
Fixes #1234
```

### Mock Diff
```diff
diff --git a/src/processors/dataProcessor.ts b/src/processors/dataProcessor.ts
index abc1234..def5678 100644
--- a/src/processors/dataProcessor.ts
+++ b/src/processors/dataProcessor.ts
@@ -15,10 +15,18 @@ export class DataProcessor {
   async process(data: Dataset): Promise<void> {
-    this.emitter.on('data', this.handleData);
-    await this.processChunks(data);
+    try {
+      this.emitter.on('data', this.handleData);
+      await this.processChunks(data);
+    } finally {
+      // Clean up event listeners
+      this.emitter.removeListener('data', this.handleData);
+      this.clearCache();
+    }
   }
   
+  private clearCache(): void {
+    this.cache.clear();
+  }
 }
```

### Expected Analysis
- **Summary**: Fixes critical memory leak by adding proper cleanup
- **Risks**:
  - Performance impact needs monitoring
  - Edge cases in cleanup logic
  - Concurrent processing scenarios
- **Should Merge**: Yes (critical fix)
- **Checklist**: Load testing, monitoring setup, rollback plan

---

## Sample PR #3: Refactoring

### PR Title
`refactor: Modernize API client with TypeScript and async/await`

### PR Description
```markdown
## Motivation
Current API client uses callbacks and lacks type safety. This makes it hard to maintain and error-prone.

## Changes
- Converted callbacks to async/await
- Added full TypeScript types
- Improved error handling
- Simplified retry logic
- Better test coverage

## Non-Goals
This is NOT changing API behavior, only internal implementation.

## Migration Guide
```typescript
// Before
api.get('/users', (err, data) => {
  if (err) return handleError(err);
  processUsers(data);
});

// After
try {
  const data = await api.get('/users');
  processUsers(data);
} catch (err) {
  handleError(err);
}
```

## Testing
- All 150+ existing tests pass
- Added 20 new tests for edge cases
- Manual testing of all endpoints
- Backward compatibility verified

## Performance
No measurable performance impact. Async/await is just syntactic sugar.
```

### Mock Diff
```diff
diff --git a/src/api/client.ts b/src/api/client.ts
index abc1234..def5678 100644
--- a/src/api/client.ts
+++ b/src/api/client.ts
@@ -1,20 +1,25 @@
-export class APIClient {
-  get(url: string, callback: Function): void {
-    fetch(url)
-      .then(res => res.json())
-      .then(data => callback(null, data))
-      .catch(err => callback(err));
+interface APIResponse<T> {
+  data: T;
+  status: number;
+}
+
+export class APIClient {
+  async get<T>(url: string): Promise<APIResponse<T>> {
+    try {
+      const response = await fetch(url);
+      const data = await response.json();
+      return { data, status: response.status };
+    } catch (error) {
+      throw new APIError('Request failed', error);
+    }
   }
 }
```

### Expected Analysis
- **Summary**: Modernizes API client with TypeScript and async patterns
- **Risks**:
  - Large refactor touches many files
  - Potential for subtle behavior changes
  - Migration effort for consumers
- **Should Merge**: Yes (well-tested improvement)
- **Checklist**: Integration testing, gradual rollout, documentation

---

## How to Use These Examples

### For CodeRabbit Testing

1. Create a branch with one of these examples
2. Make the changes described
3. Open a PR with the title and description
4. Wait for CodeRabbit review
5. Respond to feedback appropriately

### For Demo Video

Use these PRs as realistic examples when recording your demo:
- Shows AgentFlow Pro handles different PR types
- Demonstrates various risk levels
- Proves the system works end-to-end

### For Documentation

Include these as "Try these example PRs" in your README to help users test the system quickly.

---

## Creating More Examples

Good PR examples should include:
- ✅ Clear title following conventional commits
- ✅ Detailed description with context
- ✅ Test coverage information
- ✅ Impact assessment
- ✅ Realistic diff snippets
- ✅ Checklist of verification steps

This helps both CodeRabbit and AgentFlow Pro provide better analysis!