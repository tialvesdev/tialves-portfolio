import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// /api é encaminhado para o Spring Boot (backend/) em desenvolvimento.
export default defineConfig({
  plugins: [react()],
  // bundles em /static para não misturar com os PNGs de public/assets
  build: { assetsDir: 'static' },
  server: {
    port: 5173,
    proxy: { '/api': 'http://localhost:8080' },
  },
});
