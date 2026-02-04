# Implementation Plan — Annotation Environment Configuration

## Summary
Replace `NODE_ENV` check with explicit `ANNOTATION_ENABLED` flag, add configurable `ANNOTATION_DB_PATH` with auto-directory creation and graceful error handling, and add startup logging for operational visibility. All changes are localised to `server/src/app.ts`.

## Files to Create/Modify

| Path | Action | Purpose |
|------|--------|---------|
| `server/src/app.ts` | Modify | Replace NODE_ENV check, add env var config, directory creation, error handling, startup logging |

## Implementation Steps

1. **Extract annotator configuration from environment**
   - Read `ANNOTATION_ENABLED` and `ANNOTATION_DB_PATH` from `process.env`
   - Define default DB path: `./prototype-annotator/annotator.sqlite`
   - Compute `isEnabled = process.env.ANNOTATION_ENABLED === 'true'` (strict equality)

2. **Add startup logging (before conditional block)**
   - If enabled: `console.log('[Annotator] Enabled: true, DB Path: <resolvedPath>')`
   - If disabled: `console.log('[Annotator] Disabled')`

3. **Replace NODE_ENV conditional with ANNOTATION_ENABLED check**
   - Change `if (process.env.NODE_ENV === 'development')` to `if (isEnabled)`
   - Remove redundant inner `NODE_ENV` check in middleware handler

4. **Add directory creation before annotator initialisation**
   - Import `fs` and `path` modules
   - Before calling `createPrototypeAnnotator`, create parent directory:
     ```typescript
     fs.mkdirSync(path.dirname(resolvedDbPath), { recursive: true })
     ```

5. **Pass dbPath to createPrototypeAnnotator options**
   - Add `dbPath: resolvedDbPath` to the configuration object passed to `createPrototypeAnnotator`

6. **Wrap annotator initialisation in try-catch for graceful error handling**
   - Catch directory creation and annotator initialisation errors
   - Log error: `console.error('[Annotator] Failed to initialise:', error.message)`
   - Set a flag to disable annotator on error (skip middleware mounting)

7. **Update annotatorPromise initialisation to include error state**
   - Track `annotatorFailed` flag to skip processing on subsequent requests if init failed

8. **Run tests to verify all scenarios**
   - `npm test -- test/feature_annotation-env-config.test.js`

## Risks/Questions

- **prototype-annotator dbPath option**: Verify the package accepts `dbPath` in its config (check package docs/types if tests fail)
- **Lazy vs eager init**: Current implementation is lazy (loads on first request). Directory creation should also be lazy to satisfy AC-5 (no resources created when disabled)
- **Inaccessible path test (T-2.4)**: May need elevated permissions in CI to create truly inaccessible paths; test validates graceful handling pattern
