import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/reviews': 'http://localhost:8000',
      '/upload': 'http://localhost:8000',
      '/uploads': 'http://localhost:8000',
      '/export': 'http://localhost:8000',
      '/import': 'http://localhost:8000',
    }
  }
})
