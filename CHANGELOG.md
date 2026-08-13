# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2026-08-14

### Added

- Three independent entry points: `humanvoid/client`, `humanvoid/server` and the combined client-server flow.
- A scored report with `low`, `medium` and `high` probability levels. Each signal is `true`, `false` or `null`: unavailable evidence is not treated as a clean result and does not affect the score.
- Client-side collection of direct automation evidence (`navigator.webdriver` and CDP artifacts) and headless-oriented graphics evidence from WebGL, canvas and OfflineAudio.
- Server-side HTTP checks for `Sec-Fetch-*`, User-Agent Client Hints, Brotli support, `Connection: close` and application-supplied request rate.
- Cross-checks that compare a collected browser payload with request headers: browser User-Agent, locale, platform and User-Agent Client Hints.
- Optional payload policy. A server-only call evaluates the available HTTP evidence; endpoints that require a browser collector can reject a missing or malformed payload as suspicious.
- Signed, expiring challenge tokens with optional atomic one-time nonce consumption.
- Optional crawler validation for crawler-like User-Agents using reverse DNS and forward-confirmed hostnames.
- Configurable weights, thresholds, group decay, evidence minimums, timeouts and detector disabling.
- End-to-end browser harnesses that exercise the complete challenge → client collection → payload submission → server verdict route with Playwright, Puppeteer and Selenium.

[unreleased]: https://github.com/kepheer/humanvoid/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/kepheer/humanvoid/releases/tag/v1.0.0
