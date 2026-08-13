import { defineConfig } from 'tsup'

export default defineConfig([
  {
    entry: { index: 'src/index.ts' },
    outDir: 'dist',
    platform: 'neutral',
    format: ['esm'],
    dts: true,
    clean: false,
    sourcemap: true,
    minify: false,
  },
  {
    entry: { index: 'src/client/index.ts' },
    outDir: 'dist/client',
    platform: 'browser',
    target: 'es2022',
    format: ['esm'],
    dts: true,
    clean: false,
    sourcemap: true,
    minify: false,
  },
  {
    entry: { index: 'src/server/index.ts' },
    outDir: 'dist/server',
    platform: 'node',
    target: 'node22',
    format: ['esm'],
    dts: true,
    clean: false,
    sourcemap: true,
    minify: false,
  },
])
