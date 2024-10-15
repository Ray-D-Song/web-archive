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
      },
      output: {
        entryFileNames: (assetInfo) => {
          if (assetInfo.name === 'popup') {
            return 'popup/[name].js'
          }
          if (assetInfo.name === 'background') {
            return 'background/[name].js'
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
      '~': resolve(__dirname, './src'),
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
