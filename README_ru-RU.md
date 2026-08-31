# humanvoid

[English](README.md)

[![npm version](https://img.shields.io/npm/v/humanvoid?logo=npm&label=npm)](https://www.npmjs.com/package/humanvoid)
[![Pull request](https://github.com/kepheer/humanvoid/actions/workflows/pull-request.yml/badge.svg?branch=main)](https://github.com/kepheer/humanvoid/actions/workflows/pull-request.yml)
[![License](https://img.shields.io/github/license/kepheer/humanvoid)](LICENSE)

`humanvoid` оценивает вероятность того, что браузерный запрос был выполнен автоматически. Библиотека возвращает score и набор обнаруженных признаков, а приложение решает, разрешить запрос, ограничить его, потребовать challenge или заблокировать.

## Установка

```sh
npm install humanvoid
```

Только ESM. Для серверного entry point требуется Node.js 22+. Клиентский bundle рассчитан на ES2022 и не имеет runtime-зависимостей.

## Entry points

| Импорт             | Среда   | API                                           |
| ------------------ | ------- | --------------------------------------------- |
| `humanvoid`        | любая   | общие типы, веса и константы                  |
| `humanvoid/client` | браузер | `detect`, `collect`                           |
| `humanvoid/server` | Node.js | `detect`, `issueChallenge`, `verifyChallenge` |

## Варианты использования

### Только клиент

```ts
import { detect } from 'humanvoid/client'

const result = await detect()
```

Подходит для UX-решений. Посетитель контролирует выполнение JavaScript на клиенте и может подделать результат, поэтому на него нельзя полагаться как на механизм защиты.

### Только сервер

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

По умолчанию payload необязателен. Сервер анализирует доступные HTTP-данные, а клиентские и cross-check признаки помечаются как недоступные.

### Клиент + сервер

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

`consumeNonce` должен атомарно резервировать nonce и возвращать `true` только для запроса, которому удалось его зарезервировать.

Готовые к запуску примеры находятся в [`examples/`](examples/README_ru-RU.md).

## Контракт результата

```ts
type TSignalValue = boolean | null

interface IDetectResult {
  probability: 'low' | 'medium' | 'high'
  score: number
  report: Record<string, TSignalValue>
}
```

`true` означает, что признак был проверен и обнаружен; `false` — проверен, но не обнаружен; `null` — отключён, недоступен или неприменим. Значение `null` не влияет на score.

Серверный результат также содержит:

```ts
interface ICrawlerVerdict {
  name: string
  status: 'verified' | 'unverified' | 'unavailable'
}
```

Проверка краулеров выполняется только для User-Agent, похожих на поисковых роботов. Сначала выполняется reverse DNS, после чего каждое допустимое полученное имя хоста подтверждается прямым DNS-запросом. Передайте `verifyCrawler: false`, чтобы отключить DNS-проверку.

## Политика payload на сервере

По умолчанию `payloadPolicy` имеет значение `'optional'`, поэтому отсутствие payload не увеличивает score. Используйте `'required'` только для endpoint'ов, где требуется клиентский collector; в этом случае `payloadMissing` считается подозрительным признаком.

Некорректный payload приводит к `payloadSchemaInvalid: true`. Его поля `report` и `raw` не используются ни при расчёте score, ни при cross-check проверках. Collector добавляет User-Agent Client Hints, если браузер их предоставляет; при наличии соответствующих заголовков `Sec-CH-UA`, `Sec-CH-UA-Mobile` или `Sec-CH-UA-Platform` признак `clientHintsMismatch` проверяет их согласованность.

## Scoring

Признаки объединены в группы `fingerprint`, `graphics`, `http` и `crossCheck`. Client collector использует прямые признаки автоматизации (`navigator.webdriver`, артефакты сериализации CDP) и ориентированные на headless проверки рендеринга: software WebGL renderer, ограниченные возможности WebGL, недоступный canvas rendering и тихий либо аномальный OfflineAudio rendering. Догадки по окружению браузера и эвристики tampering не собираются.

| Группа      | Признак                 | Вес | Срабатывает, когда                                                        |
| ----------- | ----------------------- | --: | ------------------------------------------------------------------------- |
| fingerprint | `webdriverFlag`         |  50 | `navigator.webdriver` равен `true`                                        |
| fingerprint | `cdpArtifacts`          |  55 | на `window` или `document` есть известные ключи автоматизации             |
| graphics    | `softwareRenderer`      |  18 | WebGL сообщает известный software renderer                                |
| graphics    | `webglParamsAnomaly`    |  12 | возможности WebGL необычно ограничены                                     |
| graphics    | `canvasFingerprint`     |   8 | canvas rendering пустой или недоступен                                    |
| graphics    | `audioFingerprint`      |   8 | OfflineAudio output тихий либо имеет необычную sample rate                |
| http        | `secFetchMissing`       |  25 | у modern Chrome/Edge UA отсутствует обязательный `Sec-Fetch-*` header     |
| http        | `secChUaMismatch`       |  30 | `Sec-CH-UA` отсутствует или конфликтует с заявленным browser UA           |
| http        | `acceptEncodingAnomaly` |   8 | у modern Chrome UA нет Brotli в `Accept-Encoding`                         |
| http        | `connectionAnomaly`     |   5 | modern Chrome UA явно отправляет `Connection: close`                      |
| http        | `requestRateAnomaly`    |  25 | заданная приложением частота запросов выше порога                         |
| crossCheck  | `payloadMissing`        |  30 | payload обязателен, но отсутствует                                        |
| crossCheck  | `payloadSchemaInvalid`  |  30 | переданный payload не проходит проверку схемы                             |
| crossCheck  | `challengeInvalid`      |  50 | подписанный challenge отсутствует, истёк, некорректен или уже использован |
| crossCheck  | `languageMismatch`      |   8 | основные локали client language и `Accept-Language` различаются           |
| crossCheck  | `clientHintsMismatch`   |  25 | клиентские User-Agent Client Hints конфликтуют с заголовками              |
| crossCheck  | `uaCrossMismatch`       |  40 | User-Agent на клиенте и в HTTP-запросе различаются                        |
| crossCheck  | `platformMismatch`      |  20 | client platform и `Sec-CH-UA-Platform` различаются                        |

Если нужного browser API, header, payload или конфигурации нет, признак возвращает `null`, а не считается чистым. Веса отдают приоритет криптографическим и cross-check признакам (`challengeInvalid`, `cdpArtifacts`, `webdriverFlag`, `uaCrossMismatch`) над environment-зависимыми эвристиками, которые может сработать и у легитимного посетителя (`softwareRenderer` на VM без GPU passthrough, `canvasFingerprint` под privacy-hardened браузером, `languageMismatch` у мультиязычного пользователя).

1. Внутри группы: `максимальный вес + groupDecay × сумма остальных весов`.
2. Вклады всех групп складываются, а итоговый score ограничивается диапазоном `0..100`.
3. Для `medium` и `high` используются настраиваемые пороги. Для `high` дополнительно требуется заданное количество подозрительных признаков и групп.

Пример: `webdriverFlag` и `cdpArtifacts` в одной группе `fingerprint`. Если сработал только `webdriverFlag` — score `50` (`medium`). Если сработали оба — вклад группы `55 + 0.5 × 50 = 80` (`high`): больший вес учитывается полностью, второй урезается вдвое через `groupDecay`. Серверные признаки могут независимо повысить результат. Это ранжирование доказательств, а не доказательство того, что посетитель — бот.

В обе функции `detect` можно передать `weights`, `thresholds`, `groupDecay`, `minSignalsForHigh`, `minGroupsForHigh`, `timeoutMs` и `disabled`.

Значение `requestRate` предоставляет приложение. Используйте одну и ту же единицу измерения и временное окно для всех запросов.

## Challenge-токен

`issueChallenge(secret)` создаёт токен в формате `nonce.exp.hmac`. При получении корректного клиентского payload функция `detect` проверяет подпись токена и срок его действия. Если задан `consumeNonce`, повторное использование токена также предотвращается.

Challenge-токен не делает клиентские сигналы доверенными. Браузер контролирует выполнение собственного JavaScript и может подделать payload. Рассматривайте клиентские сигналы только как часть общей оценки вместе с HTTP-данными и дополнительными ограничениями на уровне приложения.

## Разработка

```sh
pnpm install --frozen-lockfile
pnpm test
pnpm run build:clean
pnpm run test:e2e
```

Browser harness запускает профили Playwright, Puppeteer и Selenium по полному клиент-серверному маршруту: challenge, сбор на клиенте, отправка payload и серверный verdict. Сначала установите браузерные движки Playwright:

```sh
pnpm exec playwright install chromium firefox webkit
```

## Лицензия

[MIT](LICENSE)
