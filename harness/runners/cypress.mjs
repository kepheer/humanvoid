import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import cypress from 'cypress'

const HERE = dirname(fileURLToPath(import.meta.url))
const HARNESS_DIR = join(HERE, '..')
const E2E_DIR = join(HARNESS_DIR, 'cypress', 'e2e')
const SPEC_PATH = join(E2E_DIR, 'humanvoid.cy.mjs')
const OUTPUT_PATH = join(HARNESS_DIR, 'cypress', 'output', 'result.json')

const SPEC_SOURCE = `it('collects the humanvoid result from the harness page', () => {
  cy.visit('/')

  cy.window({ timeout: 5000 })
    .its('__humanvoidResult', { timeout: 5000 })
    .should((result) => {
      expect(result).to.not.be.null
      expect(result).to.not.be.undefined
    })
    .then((result) => {
      cy.writeFile('harness/cypress/output/result.json', result)
    })
})
`

export const run = async (baseUrl) => {
  mkdirSync(E2E_DIR, { recursive: true })
  writeFileSync(SPEC_PATH, SPEC_SOURCE)
  rmSync(OUTPUT_PATH, { force: true })

  const runResult = await cypress.run({
    configFile: join(HARNESS_DIR, 'cypress.config.mjs'),
    spec: SPEC_PATH,
    config: { e2e: { baseUrl } },
    reporter: 'dot',
    quiet: true,
  })

  if (runResult.status === 'failed') {
    throw new Error(`humanvoid harness: cypress failed to start (${runResult.message})`)
  }

  if (runResult.totalFailed > 0 || existsSync(OUTPUT_PATH) === false) {
    throw new Error('humanvoid harness: cypress spec did not produce a result')
  }

  return JSON.parse(readFileSync(OUTPUT_PATH, 'utf8'))
}
