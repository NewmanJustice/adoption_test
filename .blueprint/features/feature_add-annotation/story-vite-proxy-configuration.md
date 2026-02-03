# Story — Vite Proxy Configuration

## User story
As a developer, I want the Vite development proxy to forward annotator routes to the Express backend so that the annotation system works correctly when using the React frontend.

---

## Context / scope
- Actor: Development team members
- Environment: Development only (Vite dev server)
- The Vite dev server proxies `/api/*` to `localhost:3001` (see `client/vite.config.ts`)
- Annotator routes must also be proxied for the system to function
- Reference: `/workspaces/adoption_test/.blueprint/features/feature_add-annotation/FEATURE_SPEC.md`

---

## Acceptance criteria

**AC-1 — Annotator API routes are proxied**
- Given the Vite dev server is running on port 3000,
- When I access `/__prototype-annotator/api/*` from the frontend,
- Then the request is proxied to `localhost:3001/__prototype-annotator/api/*`.

**AC-2 — Annotator dashboard is accessible via Vite**
- Given the Vite dev server is running,
- When I navigate to `http://localhost:3000/__prototype-annotator/dashboard`,
- Then the annotator management dashboard is displayed (proxied from Express server).

**AC-3 — Annotator client assets are served**
- Given the middleware injects annotator scripts,
- When the browser requests annotator client-side assets (JS, CSS),
- Then the assets are successfully served via the proxy.

**AC-4 — Existing API proxy continues to work**
- Given the annotator proxy is configured,
- When I access `/api/*` routes,
- Then they continue to proxy to the Express server as before.

**AC-5 — WebSocket connections work (if applicable)**
- Given the annotator may use WebSocket for real-time updates,
- When a WebSocket connection is initiated to the annotator path,
- Then the connection is successfully proxied to the backend.

---

## Configuration

```typescript
// Example in client/vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      },
      '/__prototype-annotator': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        ws: true  // Enable WebSocket proxy if needed
      }
    }
  }
});
```

---

## Out of scope
- Proxy configuration for production (development-only feature)
- Custom proxy middleware or request transformation
- Authentication headers for proxy requests
