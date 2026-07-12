import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Two entries: the promo page is the site root (index.html); the React app
// (app.html) is what the promo's "Enter Keep" opens. On Cloudflare, static
// files win over _redirects, so the promo must physically be index.html and
// the SPA fallback targets /app.html (see public/_redirects).
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        app: resolve(__dirname, 'app/index.html'),
      },
    },
  },
});
