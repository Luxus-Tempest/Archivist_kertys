import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      // Proxy API calls to your backend during development
      // Adjust the target to your backend URL
      '/api': {
        target: 'https://your-api.example.com',
        changeOrigin: true,
      },
      // Proxy SignalR hub
      '/hub': {
        target: 'https://your-api.example.com',
        changeOrigin: true,
        ws: true, // important for WebSocket (SignalR)
      },
    },
  },
});
