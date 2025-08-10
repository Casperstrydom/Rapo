import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Required for Render
    port: 5173,
    strictPort: true,
    hmr: {
      clientPort: 5173,
      protocol: 'ws',
    },
    allowedHosts: 'all', // Allow requests from all hosts
    proxy: {
      '/api': {
        target: import.meta.env.BACKEND_URL || 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  define: {
    'process.env': {}
  }
});