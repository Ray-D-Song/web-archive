import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
  ],
  build: {
    outDir: '../../dist/extension',
    emptyOutDir: false,
    rollupOptions: {
      input: {
        content: './contentScripts/content.ts', // Entry Point
        main: './contentScripts/main.ts',
      },
      output: {
        entryFileNames: 'contentScripts/[name].js',
      },
    },
  },
  resolve: {
    alias: {
      '~': resolve(__dirname, './src'),
    },
  },
})
