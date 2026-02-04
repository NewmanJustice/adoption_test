import { defineConfig, Plugin, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Plugin to inject prototype-annotator overlay script in development
function prototypeAnnotatorPlugin(mode: string): Plugin {
  // Load env from server directory where ANNOTATION_ENABLED is defined
  const serverEnv = loadEnv(mode, '../server', '');
  const annotationEnabled = serverEnv.ANNOTATION_ENABLED === 'true' || process.env.ANNOTATION_ENABLED === 'true';

  return {
    name: 'prototype-annotator-injector',
    transformIndexHtml(html) {
      if (!annotationEnabled) {
        return html;
      }

      // Inject the annotator config and overlay script before </body>
      const configScript = `<script>window.__PROTOTYPE_ANNOTATOR_CONFIG__=${JSON.stringify({
        basePath: '/__prototype-annotator',
        apiUrl: '/__prototype-annotator/api',
        defaultActor: 'anonymous',
        actorMode: 'prompt'
      })};</script>`;
      const overlayScript = `<script src="/__prototype-annotator/overlay.js"></script>`;

      return html.replace('</body>', `${configScript}${overlayScript}</body>`);
    }
  };
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), prototypeAnnotatorPlugin(mode)],
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/__prototype-annotator': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        ws: true,
      },
    },
  },
}));
