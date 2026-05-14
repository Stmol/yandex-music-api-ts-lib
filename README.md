# ya-music-api-ts-lib

[![CI](https://github.com/Stmol/yandex-music-api-ts-lib/actions/workflows/ci.yml/badge.svg)](https://github.com/Stmol/yandex-music-api-ts-lib/actions/workflows/ci.yml)

Zero-dependency TypeScript package for the Yandex Music API.

## Status

This repository is ready for the first public `v0.1` release.

Current scope:

- ESM package metadata for npm publication
- strict TypeScript build and test bootstrap
- manual TypeScript model foundation for Yandex Music API types
- HTTP transport and resource layer
- immutable top-level API client
- zero-runtime-dependency package contract checks
- Node test-build pipeline
- runtime smoke tests for Node.js, Bun, and Deno
- release validation workflow for typecheck, Node tests, Bun smoke tests, Deno smoke tests, and package dry-run on pushed version tags

Beta scope:

- curated handwritten models for account, artist, album, track, playlist, search, landing, feed, genre, queue, radio, history, and shared read-only shapes
- expanded read-only models for nested track metadata, album volumes/trailers/similar entities, artist brief/tracks/albums/similar results, landing lists/chart/tag results, genres, radio station results, and music history
- read-only account, tracks, albums, playlists, search, artists, landing/feed, genres, radio, and history resources
- `fetch`-based default transport with OAuth header support
- custom transport injection for tests and advanced runtime integration
- ESM package exports for the root client API and the models subpath

Known gaps:

- not all Yandex Music API models and endpoints are covered yet
- write/download-heavy flows, likes/pins, playlist mutations, and radio feedback are outside the current read-only scope
- no live API integration tests are included, so the test suite does not require secrets or network access
- no CommonJS build is published
- no browser-specific support matrix is documented yet

Published package surface:

- `ya-music-api-ts-lib`
- `ya-music-api-ts-lib/models`

The npm package currently includes only `dist`, `README.md`, `LICENSE`, and `package.json`.

## Installation

```fish
npm install ya-music-api-ts-lib
```

To access the Yandex Music API you need an OAuth token.
One practical way to get it is [Stmol/yandex-oauth-token](https://github.com/Stmol/yandex-oauth-token).

## Usage

```ts
import { YandexMusicClient } from "ya-music-api-ts-lib";

const client = new YandexMusicClient({
  oauthToken: process.env.YANDEX_MUSIC_TOKEN,
});

const status = await client.account.status({ language: "en" });
const tracks = await client.tracks.byIds(["11:22", "33:44"], {
  language: "en",
});
const search = await client.search.search("Muse", {
  language: "en",
  type: "track",
});
```

You can provide a custom transport implementation when you need to control authentication, retries, or the runtime fetch integration yourself.

```ts
import {
  YandexMusicClient,
  type HttpRequest,
  type HttpResponse,
  type HttpTransport,
} from "ya-music-api-ts-lib";

class MockTransport implements HttpTransport {
  async request(request: HttpRequest): Promise<HttpResponse> {
    return {
      body: { result: { request } },
      headers: {},
      status: 200,
      statusText: "OK",
      url: "https://example.test/mock",
    };
  }
}

const client = new YandexMusicClient({
  transport: new MockTransport(),
});

await client.account.status();
```

This repository was made possible by the prior work in [MarshalX/yandex-music-api](https://github.com/MarshalX/yandex-music-api/tree/main/yandex_music), which served as the implementation reference for translating proven Yandex Music API behavior into TypeScript.
Many thanks to MarshalX for that work.

## Release Validation

The GitHub Actions workflow runs only when a new version tag matching `v*` is pushed.
It validates typecheck, Node tests, Bun smoke tests, Deno smoke tests, and `npm pack --dry-run`.

## Development

```fish
npm run check:types
npm run build
npm run build:tests
npm run test:meta
npm run test:node
npm run test:bun
npm run test:deno
npm pack --dry-run
```
