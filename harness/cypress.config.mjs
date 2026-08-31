import { defineConfig } from 'cypress'

export default defineConfig({
  video: false,
  screenshotOnRunFailure: false,
  fixturesFolder: false,
  allowCypressEnv: false,
  e2e: {
    specPattern: 'harness/cypress/e2e/**/*.cy.mjs',
    supportFile: false,
  },
})
