import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages serves this repo's root straight from the main branch, so the
// source page lives in web/ and `npm run build` copies the built site to the root
// (see scripts/publish.mjs).
// Relative base keeps it working under /<repo>/ and on a custom domain alike.
export default defineConfig({
  root: 'web',
  base: './',
  publicDir: '../public',
  plugins: [react()],
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    chunkSizeWarningLimit: 1500,
  },
})
