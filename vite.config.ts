import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
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
