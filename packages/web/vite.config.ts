import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import generouted from '@generouted/react-router/plugin'

export default defineConfig({
  plugins: [react(), generouted()],
  resolve: {
    alias: {
      '~': '/src',
    },
  },
  server: {
    port: 7749,
    proxy: {
      '/api': {
        target: 'http://localhost:9981',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      input: './src/index.tsx',
      output: {
        entryFileNames: 'index.js',
        assetFileNames: 'index.css',
      },
    },
    outDir: '../../dist/service/src/static',
  },
})
