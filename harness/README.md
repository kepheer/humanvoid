# Browser harness

[Русский](README_ru-RU.md)

The harness runs the full built-package path against automation profiles: `GET /challenge` → client `collect()` → `POST /verify` → server `detect()`. Each gate uses the server verdict, including HTTP, payload-schema, challenge, client-report, and client/server cross-check signals. The stealth profile is an explicit low-expectation evasion control; every other profile must produce at least `medium` from direct automation evidence.

```sh
pnpm run test:e2e
```

Install browser engines once:

```sh
pnpm exec playwright install chromium firefox webkit
```

Profiles are defined in `matrix.config.mjs`:

| Profile                        | Driver                                             |
| ------------------------------ | -------------------------------------------------- |
| `playwright-chromium-headless` | Playwright Chromium                                |
| `playwright-chromium-headful`  | Playwright Chromium                                |
| `playwright-firefox-headless`  | Playwright Firefox                                 |
| `playwright-webkit-headless`   | Playwright WebKit                                  |
| `playwright-stealth-chromium`  | Playwright Extra + stealth plugin                  |
| `puppeteer-headless`           | Puppeteer                                          |
| `puppeteer-cdp-session`        | Puppeteer browser controlled through a CDP session |
| `selenium-chrome-headless`     | Selenium + chromedriver                            |

`puppeteer-cdp-session` is not raw CDP: Puppeteer launches the browser and creates the page before CDP commands are sent. It exists to compare Puppeteer's high-level page API with direct CDP navigation and evaluation in the same browser process.

The harness verifies the integration path and known automation behaviour. It does not replace clean-browser negative controls. Capture those separately with browser, OS, version, flags, timestamp, built package version, raw values, and tri-state outcomes.
