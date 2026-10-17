import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // so a phone on the LAN / a tunnel can reach it
    // Vite blocks unknown Host headers by default, which silently kills the
    // tunnel with "Blocked request". Allow the quick-tunnel domain only.
    allowedHosts: ['.trycloudflare.com'],
    proxy: {
      '/api': 'http://localhost:8787',
      '/ws': { target: 'ws://localhost:8787', ws: true },
    },
  },
});
