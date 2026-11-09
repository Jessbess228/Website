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
})
