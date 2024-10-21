import { resolve } from 'node:path'
import honoBuild from '@hono/vite-cloudflare-pages'
import devServer from '@hono/vite-dev-server'
import adapter from '@hono/vite-dev-server/cloudflare'
import type { UserConfig } from 'vite'
import { defineConfig } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig((): UserConfig => {
  return {
    resolve: {
      alias: {
        '~': resolve(__dirname, 'src'),
      },
    },
    server: {
      port: 9981,
    },
    plugins: [
      honoBuild({
        entry: 'src/server.ts',
        minify: false,
        external: ['/static'],
        outputDir: '../../dist/service/src',
      }),
      devServer({
        adapter,
        entry: 'src/server.ts',
      }),
      viteStaticCopy({
        targets: [
          {
            src: ['./wrangler.raw.toml'],
            dest: '../',
            rename: 'wrangler.toml',
          },
          {
            src: './src/sql/init.sql',
            dest: '../',
          },
        ],
      }),
    ],
  }
})
