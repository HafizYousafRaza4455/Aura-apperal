/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.ts'],
    // CRITICAL: Windows host stability requires 'threads' pool.
    // Default 'forks' pool triggers 60s IPC pipe timeout on Windows.
    pool: 'threads',
    testTimeout: 15000,
    include: ['src/tests/**/*.test.{ts,tsx}'],
  },
});
