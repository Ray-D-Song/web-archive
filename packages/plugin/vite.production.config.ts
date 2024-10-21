import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        { src: 'manifest.json', dest: '.' },
        { src: 'lib', dest: '.' },
        { src: 'assets', dest: '.' },
      ],
    }),
  ],
  build: {
    outDir: '../../dist/extension',
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'popup/index.html'),
        background: resolve(__dirname, 'background/background.ts'),
        content: './contentScripts/content.ts', // Entry Point
        main: './contentScripts/main.ts',
      },
      output: {
        entryFileNames: (assetInfo) => {
          if (assetInfo.name === 'popup') {
            return 'popup/[name].js'
          }
          if (assetInfo.name === 'background') {
            return 'background/[name].js'
          }
          if (assetInfo.name === 'content' || assetInfo.name === 'main') {
            return 'contentScripts/[name].js'
          }
          return '[name].js'
        },
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
  resolve: {
    alias: {
      '~': '',
    },
  },
  server: {
    strictPort: true,
    port: 5174,
    hmr: {
      clientPort: 5174,
    },
  },
})
