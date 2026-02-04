# Test Specification — Annotation Environment Configuration

## Understanding
This feature extends the prototype-annotator with explicit environment control:
1. `ANNOTATION_ENABLED` flag replaces `NODE_ENV` check for middleware activation
2. `ANNOTATION_DB_PATH` configures SQLite database location for Azure persistence
3. Startup logging provides operational visibility of annotator configuration
The secure-by-default behaviour requires explicit `ANNOTATION_ENABLED=true` to activate.

---

## AC to Test ID Mapping

### Story 1: Annotation Enable Flag
| AC | Test ID | Scenario |
|----|---------|----------|
| AC-1 | T-1.1 | `ANNOTATION_ENABLED=true` mounts middleware |
| AC-2 | T-1.2 | `ANNOTATION_ENABLED=false` does not mount middleware |
| AC-3 | T-1.3 | Unset `ANNOTATION_ENABLED` does not mount (secure-by-default) |
| AC-4 | T-1.4a | `ANNOTATION_ENABLED=yes` does not mount |
| AC-4 | T-1.4b | `ANNOTATION_ENABLED=1` does not mount |
| AC-4 | T-1.4c | `ANNOTATION_ENABLED=TRUE` does not mount |
| AC-5 | T-1.5 | `ANNOTATION_ENABLED=true` + `NODE_ENV=production` still mounts |

### Story 2: Database Path Configuration
| AC | Test ID | Scenario |
|----|---------|----------|
| AC-1 | T-2.1 | Custom `ANNOTATION_DB_PATH` is used |
| AC-2 | T-2.2 | Default path used when `ANNOTATION_DB_PATH` unset |
| AC-3 | T-2.3 | Parent directory auto-created when missing |
| AC-4 | T-2.4 | Inaccessible path logs error, disables gracefully |
| AC-5 | T-2.5 | Path config ignored when `ANNOTATION_ENABLED=false` |

### Story 3: Startup Logging
| AC | Test ID | Scenario |
|----|---------|----------|
| AC-1 | T-3.1 | Logs `[Annotator] Enabled: true, DB Path: <path>` when enabled |
| AC-2 | T-3.2 | Logs `[Annotator] Disabled` when disabled |
| AC-3 | T-3.3 | Log shows resolved default path, not undefined |
| AC-4 | T-3.4 | Log output at INFO level |

---

## Key Assumptions

- Middleware availability is tested by checking route response (200 vs 404)
- `true` is the only accepted value for `ANNOTATION_ENABLED` (case-sensitive)
- Default database path is `./prototype-annotator/annotator.sqlite`
- Logging uses `console.log` or equivalent at INFO level
- Application does not crash when database path is inaccessible
- Tests use environment variable manipulation before app initialisation
- Directory creation uses `fs.mkdirSync` with `recursive: true` or equivalent

---

## Traceability Table

| Story | AC Count | Test IDs | Coverage |
|-------|----------|----------|----------|
| Enable Flag | 5 | T-1.1 to T-1.5 | 100% |
| Database Path | 5 | T-2.1 to T-2.5 | 100% |
| Startup Logging | 4 | T-3.1 to T-3.4 | 100% |
| **Total** | **14** | **16 tests** | **100%** |
