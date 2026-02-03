# Implementation Plan: add-annotation

## Summary
Integrate the pre-installed `prototype-annotator` npm package into the Express server with development-only activation via NODE_ENV check. Configure Vite proxy to forward annotator routes and add .gitignore entry for the SQLite database directory.

## Files to Create/Modify

| Path | Action | Purpose |
|------|--------|---------|
| `server/src/app.ts` | Modify | Add prototype-annotator middleware with NODE_ENV guard |
| `client/vite.config.ts` | Modify | Add proxy rule for `/__prototype-annotator` with WebSocket support |
| `.gitignore` | Modify | Add entry for `/prototype-annotator/` directory |

## Implementation Steps

1. **Import prototype-annotator in app.ts**
   - Add conditional import: `import { prototypeAnnotator } from 'prototype-annotator'`
   - Place import at top with other imports

2. **Add NODE_ENV check and middleware mount**
   - Add after session middleware, before API routes:
   ```typescript
   if (process.env.NODE_ENV === 'development') {
     app.use(prototypeAnnotator({
       basePath: '/__prototype-annotator',
       actorMode: 'prompt',
       urlMode: 'canonical'
     }));
   }
   ```

3. **Update Vite proxy configuration**
   - Add new proxy entry in `client/vite.config.ts`:
   ```typescript
   '/__prototype-annotator': {
     target: 'http://localhost:3001',
     changeOrigin: true,
     ws: true
   }
   ```

4. **Update .gitignore**
   - Add entry with explanatory comment:
   ```gitignore
   # Prototype annotator - development annotation data
   /prototype-annotator/
   ```

5. **Run tests to verify**
   - Execute `npx jest test/feature_add-annotation.test.js`
   - Verify: T-EMI-1, T-EMI-4, T-EMI-5, T-VPC-*, T-DER-*, T-GIT-* pass

## Risks/Questions

- **Middleware order**: Mount annotator BEFORE notFoundHandler to ensure routes are matched
- **TypeScript types**: May need `@types/prototype-annotator` or type declaration if package lacks types
- **Dynamic import alternative**: If tree-shaking is needed for production builds, consider `await import()` syntax instead of static import
