# Runtime Compatibility

This document defines the supported runtime contract for `ya-music-api-ts-lib` starting with `v1.0.0`.

## Stable Support

The stable runtime targets are:

- Node.js `>=22`
- Bun `>=1.1`

These targets are part of the package metadata and the release gate.

## Verified Compatibility

The repository also runs a smoke test for:

- Deno `2.x`

Deno support is considered compatible for ESM consumers, but Node.js and Bun remain the primary release targets because only those runtimes are declared in `package.json#engines`.

## Browser And Edge Environments

The package can run in browser-like environments only when all of the following are true:

- ESM imports are supported
- the runtime provides standards-compatible `fetch`, `URL`, `Headers`, `Request`, `Response`, and `AbortController`
- the application is allowed to hold and send a Yandex Music OAuth token from that environment

Browser and edge runtimes are currently:

- supported on a best-effort basis
- not covered by CI smoke tests
- not part of the release gate for `v1.0.0`

That means browser usage should be treated as an integration choice owned by the host application, not as a guaranteed first-class target of this library.

## Module Format

- Package format: ESM only
- CommonJS: not published
- `require(...)`: unsupported

Consumers must import the package through:

- `ya-music-api-ts-lib`
- `ya-music-api-ts-lib/models`

No other subpaths are public API.

## Runtime Requirements

The built-in transport depends on these host APIs:

- `fetch`
- `URL`
- `Headers`
- `Request`
- `Response`
- `AbortController`
- `setTimeout`
- `clearTimeout`

If a runtime does not expose a compatible `fetch`, the consumer must provide one through `YandexMusicClient({ fetch })` or replace the full transport with `transport`.

## Environment Guidance

- Prefer server-side usage for production credentials.
- Avoid direct browser integration unless the token exposure model is explicitly acceptable.
- For tests, prefer `transport` injection over live network calls.
