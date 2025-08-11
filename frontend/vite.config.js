import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Changed from 'localhost' to '0.0.0.0'
    port: 5173,
    strictPort: true,
    hmr: {
      clientPort: 5173,
      protocol: 'ws',
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // You might need to update this too for Render
        changeOrigin: true,
        secure: false
      }
    }
  }
});