import { startServer } from './page/server.mjs'
import { MATRIX } from './matrix.config.mjs'
import { evaluateGate } from './lib/gate.mjs'

const PORT = 4173
const BASE_URL = `http://localhost:${PORT}`

const formatTriggeredKeys = (report) =>
  Object.entries(report)
    .filter(([, triggered]) => triggered === true)
    .map(([key]) => key)
    .join(', ')

const printTable = (rows) => {
  const header = ['profile', 'probability', 'score', 'triggered detectors']
  const widths = header.map((title, columnIndex) =>
    Math.max(title.length, ...rows.map((row) => String(row[columnIndex]).length)),
  )

  const printRow = (cells) => {
    console.log(cells.map((cell, columnIndex) => String(cell).padEnd(widths[columnIndex])).join(' | '))
  }

  printRow(header)
  printRow(widths.map((width) => '-'.repeat(width)))
  rows.forEach((row) => printRow(row))
}

const runProfile = async (profile) => {
  try {
    const result = await profile.run(BASE_URL)
    const gate = evaluateGate(profile, result)

    return { profile, result, gate }
  } catch (error) {
    return {
      profile,
      result: null,
      gate: { pass: false, reason: `threw: ${error.message}` },
    }
  }
}

const main = async () => {
  const server = await startServer(PORT)

  const outcomes = []

  for (const profile of MATRIX) {
    console.log(`running profile: ${profile.name}...`)
    outcomes.push(await runProfile(profile))
  }

  server.close()

  const rows = outcomes.map(({ profile, result, gate }) => [
    profile.name,
    result === null ? 'ERROR' : result.probability,
    result === null ? '-' : result.score,
    result === null ? gate.reason : formatTriggeredKeys(result.report),
  ])

  console.log('')
  printTable(rows)

  const failed = outcomes.filter((outcome) => outcome.gate.pass === false)

  console.log('')
  console.log(`gates passed: ${outcomes.length - failed.length}/${outcomes.length}`)

  if (failed.length > 0) {
    console.log('failed profiles:')
    failed.forEach((outcome) => {
      console.log(`  - ${outcome.profile.name}: ${outcome.gate.reason}`)
    })

    process.exitCode = 1
    return
  }

  process.exitCode = 0
}

main()
