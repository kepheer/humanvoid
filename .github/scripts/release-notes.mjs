import { readFile } from 'node:fs/promises'

const version = process.argv[2]?.replace(/^v/, '')

if (version === undefined || version.length === 0) {
  throw new Error('Usage: node .github/scripts/release-notes.mjs <version>')
}

const changelog = await readFile(new URL('../../CHANGELOG.md', import.meta.url), 'utf8')
const heading = `## [${version}]`
const start = changelog.indexOf(heading)

if (start === -1) {
  throw new Error(`CHANGELOG.md has no ${heading} section`)
}

const nextHeading = changelog.indexOf('\n## [', start + heading.length)
const notes = changelog.slice(start, nextHeading === -1 ? undefined : nextHeading).trim()

process.stdout.write(`${notes}\n`)
