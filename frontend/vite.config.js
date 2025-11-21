import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'BurgerLog',
        short_name: 'BurgerLog',
        description: 'ハンバーガーのレビュー記録アプリ',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  server: {
    proxy: {
      '/reviews': 'http://localhost:8000',
      '/upload': 'http://localhost:8000',
      '/uploads': 'http://localhost:8000',
      '/export': 'http://localhost:8000',
      '/import': 'http://localhost:8000',
    }
  },
  preview: {
    allowedHosts: true
  }
})
