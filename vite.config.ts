/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// On GitHub Pages the app is served from /<repo>/, injected as VITE_BASE by the
// deploy workflow. Locally (dev / preview) it stays at the root.
export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
  plugins: [react()],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
