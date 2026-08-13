import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const ALIAS = {
  '@core': fileURLToPath(new URL('./src/core', import.meta.url)),
  '@client': fileURLToPath(new URL('./src/client', import.meta.url)),
  '@server': fileURLToPath(new URL('./src/server', import.meta.url)),
}

export default defineConfig({
  resolve: {
    alias: ALIAS,
  },
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'lcov'],
      reportsDirectory: 'coverage',
      thresholds: {
        statements: 70,
        branches: 60,
        functions: 70,
        lines: 70,
      },
    },
    projects: [
      {
        resolve: {
          alias: ALIAS,
        },
        test: {
          name: 'client',
          environment: 'jsdom',
          include: ['tests/client/**/*.test.ts'],
        },
      },
      {
        resolve: {
          alias: ALIAS,
        },
        test: {
          name: 'server',
          environment: 'node',
          include: ['tests/server/**/*.test.ts'],
        },
      },
      {
        resolve: {
          alias: ALIAS,
        },
        test: {
          name: 'core',
          environment: 'node',
          include: ['tests/core/**/*.test.ts'],
        },
      },
      {
        resolve: {
          alias: ALIAS,
        },
        test: {
          name: 'harness',
          environment: 'node',
          include: ['tests/harness/**/*.test.ts'],
        },
      },
    ],
  },
})
