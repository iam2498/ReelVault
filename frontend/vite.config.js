import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/download': 'http://127.0.0.1:8000',
      '/Process-audio': 'http://127.0.0.1:8000',
      '/search': 'http://127.0.0.1:8000',
      '/process-frames': 'http://127.0.0.1:8000',
      '/Process-frames': 'http://127.0.0.1:8000',
    }
  }
})
