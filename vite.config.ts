import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Match: /api, /api/puppies/, /api/puppies/filters/, …
      '/api': {
        // Django runserver (see puppy_data-collection repo)
        target: 'http://127.0.0.1:8080',
        // Rewrite the Host header so Django sees a normal local request
        changeOrigin: true,
      },
      // Sync Consulting app (sibling repo, Vite base `/sync-app/`, port 5174)
      '/sync-app': {
        target: 'http://127.0.0.1:5174',
        changeOrigin: true,
        ws: true,
      },
    },
  },
})
