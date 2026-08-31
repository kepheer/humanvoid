# humanvoid

[Русский](README_ru-RU.md)

[![npm version](https://img.shields.io/npm/v/humanvoid?logo=npm&label=npm)](https://www.npmjs.com/package/humanvoid)
[![Pull request](https://github.com/kepheer/humanvoid/actions/workflows/pull-request.yml/badge.svg)](https://github.com/kepheer/humanvoid/actions/workflows/pull-request.yml)
[![License](https://img.shields.io/github/license/kepheer/humanvoid)](LICENSE)

`humanvoid` scores the likelihood that a browser request is automated. It returns evidence and a score; the application decides whether to allow, throttle, challenge, or block a request.

## Install

```sh
npm install humanvoid
```

ESM only. Node 22+ for the server entry point. The client bundle targets ES2022 and has no runtime dependencies.

## Entry points

| Import             | Environment | API                                           |
| ------------------ | ----------- | --------------------------------------------- |
| `humanvoid`        | any         | shared types, weights, constants              |
| `humanvoid/client` | browser     | `detect`, `collect`                           |
| `humanvoid/server` | Node.js     | `detect`, `issueChallenge`, `verifyChallenge` |

## Usage modes

### Client only

```ts
import { detect } from 'humanvoid/client'

const result = await detect()
```

Use this for UX decisions. Client code and its result are controlled by the visitor, so it is not a security boundary.

### Server only

```ts
import { detect } from 'humanvoid/server'

const result = await detect(
  {
    headers: request.headers,
    ip: request.ip ?? null,
    requestRate: requestsPerMinute,
  },
  { verifyCrawler: false },
)
```

Payload is optional by default. The server evaluates the available HTTP data and marks client and cross-check signals as unavailable.

### Client + server

```ts
import { collect } from 'humanvoid/client'
import { detect, issueChallenge } from 'humanvoid/server'

const challenge = issueChallenge(secret)
const payload = await collect({ challenge })

const result = await detect(
  { payload, headers: request.headers, ip: request.ip ?? null, requestRate: requestsPerMinute },
  {
    secret,
    payloadPolicy: 'required',
    consumeNonce: (nonce, exp) => redis.set(`humanvoid:${nonce}`, '1', { NX: true, PXAT: exp }),
  },
)
```

`consumeNonce` must atomically reserve the nonce and return `true` only for the request that reserved it.

Runnable examples are in [`examples/`](examples/README.md).

## Result contract

```ts
type TSignalValue = boolean | null

interface IDetectResult {
  probability: 'low' | 'medium' | 'high'
  score: number
  report: Record<string, TSignalValue>
}
```

`true` means a signal was checked and fired; `false` means it was checked and did not fire; `null` means it was disabled, unavailable, or not applicable. `null` never adds to the score.

The server result adds:

```ts
interface ICrawlerVerdict {
  name: string
  status: 'verified' | 'unverified' | 'unavailable'
}
```

Crawler verification runs only for crawler-like UAs. It performs reverse DNS and confirms every allowed returned hostname with a forward lookup. Set `verifyCrawler: false` to avoid DNS.

## Server payload policy

`payloadPolicy` is `'optional'` by default. Missing payload has no penalty. Set it to `'required'` only on an endpoint that requires the browser collector; then `payloadMissing` is suspicious.

Malformed payload produces `payloadSchemaInvalid: true`, and its report/raw fields are never used for scoring or cross-checking. The client collector also includes User-Agent Client Hints when the browser exposes them; when matching `Sec-CH-UA`, `Sec-CH-UA-Mobile`, or `Sec-CH-UA-Platform` headers are present, `clientHintsMismatch` checks their consistency.

## Scoring

Signals are grouped into `fingerprint`, `graphics`, `http`, and `crossCheck`. The client collector uses direct automation evidence (`navigator.webdriver`, CDP serialization artifacts) plus headless-oriented rendering checks: software WebGL renderer, constrained WebGL capabilities, unavailable canvas rendering, and silent or abnormal OfflineAudio rendering. Browser-environment guesses and tampering heuristics are not collected.

| Group       | Signal                  | Weight | Suspicious when                                                 |
| ----------- | ----------------------- | -----: | --------------------------------------------------------------- |
| fingerprint | `webdriverFlag`         |     50 | `navigator.webdriver` is `true`                                 |
| fingerprint | `cdpArtifacts`          |     55 | known automation keys exist on `window` or `document`           |
| graphics    | `softwareRenderer`      |     18 | WebGL reports a known software renderer                         |
| graphics    | `webglParamsAnomaly`    |     12 | WebGL capabilities are unusually constrained                    |
| graphics    | `canvasFingerprint`     |      8 | canvas rendering is empty or unavailable                        |
| graphics    | `audioFingerprint`      |      8 | OfflineAudio output is silent or has an unusual sample rate     |
| http        | `secFetchMissing`       |     25 | a modern Chrome/Edge UA lacks a required `Sec-Fetch-*` header   |
| http        | `secChUaMismatch`       |     30 | `Sec-CH-UA` is missing or conflicts with the claimed browser UA |
| http        | `acceptEncodingAnomaly` |      8 | a modern Chrome UA lacks Brotli in `Accept-Encoding`            |
| http        | `connectionAnomaly`     |      5 | a modern Chrome UA explicitly sends `Connection: close`         |
| http        | `requestRateAnomaly`    |     25 | application-provided request rate exceeds its threshold         |
| crossCheck  | `payloadMissing`        |     30 | payload is required but absent                                  |
| crossCheck  | `payloadSchemaInvalid`  |     30 | supplied payload fails schema validation                        |
| crossCheck  | `challengeInvalid`      |     50 | signed challenge is missing, expired, invalid, or reused        |
| crossCheck  | `languageMismatch`      |      8 | client language and `Accept-Language` primary locales differ    |
| crossCheck  | `clientHintsMismatch`   |     25 | client User-Agent Client Hints conflict with their headers      |
| crossCheck  | `uaCrossMismatch`       |     40 | client and HTTP User-Agent values differ                        |
| crossCheck  | `platformMismatch`      |     20 | client platform and `Sec-CH-UA-Platform` differ                 |

Signals without the required browser API, header, payload, or configuration return `null` rather than being counted as clean. Weights favor cryptographic and cross-check evidence (`challengeInvalid`, `cdpArtifacts`, `webdriverFlag`, `uaCrossMismatch`) over environment-dependent heuristics that legitimate setups can also trigger (`softwareRenderer` on a VM without GPU passthrough, `canvasFingerprint` under privacy-hardened browsers, `languageMismatch` on a multilingual visitor).

1. Within a group: `highest weight + groupDecay × sum(other weights)`.
2. Group contributions add together and are clamped to `0..100`.
3. `medium` and `high` use configurable thresholds. `high` also requires the configured number of suspicious signals and groups.

Example: `webdriverFlag` and `cdpArtifacts` are both in the `fingerprint` group. If only `webdriverFlag` fires, the score is `50` (`medium`). If both fire, the group contributes `55 + 0.5 × 50 = 80` (`high`), because the higher weight counts in full and the other one is halved by `groupDecay`. Server signals can independently raise the result. This is evidence ranking, not proof that a visitor is a bot.

Pass `weights`, `thresholds`, `groupDecay`, `minSignalsForHigh`, `minGroupsForHigh`, `timeoutMs`, or `disabled` to either `detect` function. `requestRate` is application-provided; use one documented unit and window consistently.

## Challenge token

`issueChallenge(secret)` creates `nonce.exp.hmac`. `detect` validates its signature and expiry when a valid client payload is supplied. With `consumeNonce`, it also prevents a token from being used more than once.

The token does not make client-reported signals trustworthy. The browser controls its own JavaScript and can forge a payload. Treat client signals as evidence combined with HTTP and application-specific controls.

## Development

```sh
pnpm install --frozen-lockfile
pnpm test
pnpm run build:clean
pnpm run test:e2e
```

The browser harness launches Playwright, Puppeteer, and Selenium profiles through the complete client-server flow: challenge, client collection, payload submission, and server verdict. Install Playwright engines first:

```sh
pnpm exec playwright install chromium firefox webkit
```

## License

[MIT](LICENSE)
