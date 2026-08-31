# Browser harness

[English](README.md)

Harness запускает собранный пакет по полному пути автоматизации: `GET /challenge` → клиентский `collect()` → `POST /verify` → серверный `detect()`. Каждая проверка использует server verdict, включая HTTP, схему payload, challenge, клиентский report и client-server cross-check. Stealth-профиль — это явный контроль обхода с ожидаемым `low`; от остальных профилей требуется как минимум `medium` по прямым признакам автоматизации.

```sh
pnpm run test:e2e
```

Один раз установите браузерные движки:

```sh
pnpm exec playwright install chromium firefox webkit
```

Профили определены в `matrix.config.mjs`:

| Профиль                        | Драйвер                                      |
| ------------------------------ | -------------------------------------------- |
| `playwright-chromium-headless` | Playwright Chromium                          |
| `playwright-chromium-headful`  | Playwright Chromium                          |
| `playwright-firefox-headless`  | Playwright Firefox                           |
| `playwright-webkit-headless`   | Playwright WebKit                            |
| `playwright-stealth-chromium`  | Playwright Extra + stealth plugin            |
| `puppeteer-headless`           | Puppeteer                                    |
| `puppeteer-cdp-session`        | Браузер Puppeteer под управлением CDP-сессии |
| `selenium-chrome-headless`     | Selenium + chromedriver                      |
| `cypress-chrome-headless`      | Cypress (Chrome, запущенный через CDP)       |

`puppeteer-cdp-session` не является raw CDP: Puppeteer запускает браузер и создаёт страницу, после чего команды отправляются через CDP-сессию. Это сравнение high-level API Puppeteer с прямой CDP-навигацией и выполнением кода в одном процессе браузера.

Harness проверяет интеграционный путь и известное поведение автоматизации. Он не заменяет negative controls в обычных браузерах. Их следует снимать отдельно с указанием браузера, ОС, версии, флагов, времени, версии собранного пакета, raw-значений и tri-state результатов.
