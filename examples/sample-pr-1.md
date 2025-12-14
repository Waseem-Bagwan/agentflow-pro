# Sample PR: Improve caching layer

This sample PR makes a set of changes focused on improving caching behavior across the service.

- Refactor `src/cache/*` to use a centralized cache interface
- Add tests covering cache invalidation logic
- Update README and CHANGELOG

Files changed:
- src/cache/index.ts
- src/cache/memory.ts
- src/cache/redis.ts
- tests/cache/cache.test.ts
- docs/CHANGELOG.md
- README.md

Diff (truncated):

diff --git a/src/cache/index.ts b/src/cache/index.ts
--- a/src/cache/index.ts
+++ b/src/cache/index.ts
@@
-// previous implementation
+// new implementation
