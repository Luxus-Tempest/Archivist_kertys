import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://209.209.40.100:3007',
        changeOrigin: true,
        secure: false
      },
      '/events': {
        target: 'http://209.209.40.100:3007',
        changeOrigin: true,
        secure: false,
        ws: true
      }
    }
  }
})
