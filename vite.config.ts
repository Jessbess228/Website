import faroUploader from '@grafana/faro-rollup-plugin'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type PluginOption } from 'vite'

const nodeProcess = (
  globalThis as { process?: { cwd: () => string; env: Record<string, string | undefined> } }
).process

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, nodeProcess?.cwd() ?? '.', '')
  const faroApiKey = env.GRAFANA_API_TOKEN || nodeProcess?.env.GRAFANA_API_TOKEN

  return {
    build: { sourcemap: 'hidden' },
    plugins: [
      react(),
      ...(faroApiKey
        ? [
            faroUploader({
              appName: 'Jess website',
              endpoint: 'https://faro-api-prod-au-southeast-1.grafana.net/faro/api/v1',
              appId: '698',
              stackId: '1935596',
              apiKey: faroApiKey,
              gzipContents: true,
            }),
          ]
        : []),
    ] as PluginOption[],
    server: {
      proxy: {
        // Match: /api, /api/puppies/, /api/puppies/filters/, …
        '/api': {
          // Django runserver (see puppy_data-collection repo)
          target: 'http://127.0.0.1:8080',
          // Rewrite the Host header so Django sees a normal local request
          changeOrigin: true,
        },
        '/website-builder': {
          target: 'http://127.0.0.1:5174',
          changeOrigin: true,
          ws: true,
        },
        '/cms-api': {
          target: 'http://127.0.0.1:5556',
          changeOrigin: true,
        },
      },
    },
  }
})
