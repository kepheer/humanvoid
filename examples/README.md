# Examples

[Русский](README_ru-RU.md)

Run `pnpm run build:clean` first. Each example imports the local built package.

| Mode            | Run                                                             | Result                                                                                                     |
| --------------- | --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Client only     | Serve the repository and open `examples/client-only/index.html` | Browser runs and scores client detectors locally.                                                          |
| Server only     | `node examples/server-only/server.mjs`                          | Server scores HTTP request data; no payload is required.                                                   |
| Client + server | `node examples/client-server/server.mjs`                        | Browser obtains a challenge, collects signals, posts them, and the server verifies and scores the request. |
