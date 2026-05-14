# ya-music-api-ts-lib

[![CI](https://github.com/Stmol/yandex-music-api-ts-lib/actions/workflows/ci.yml/badge.svg)](https://github.com/Stmol/yandex-music-api-ts-lib/actions/workflows/ci.yml)

Zero-dependency TypeScript package for the Yandex Music API.

## Status

This repository is ready for public release.

Current scope:

- ESM package metadata for npm publication
- strict TypeScript build and test bootstrap
- manual TypeScript model foundation for Yandex Music API types
- HTTP transport and resource layer
- immutable top-level API client
- zero-runtime-dependency package contract checks
- Node test-build pipeline
- runtime smoke tests for Node.js, Bun, and Deno
- LLM-oriented usage map for agents integrating the package into applications
- release validation workflow for typecheck, Node tests, Bun smoke tests, Deno smoke tests, and package dry-run on pushed release tags

Beta scope:

- curated handwritten models for account, artist, album, track, playlist, search, landing, feed, genre, queue, radio, history, and shared read-only shapes
- expanded read-only models for nested track metadata, album volumes/trailers/similar entities, artist brief/tracks/albums/similar results, landing lists/chart/tag results, genres, radio station results, and music history
- read-only model parity wave covering clip, concert, label, metatag, shot, skeleton, wave, and expanded nested account/artist/album/landing/playlist/radio/history/track shapes
- read-only account, tracks, albums, playlists, search, artists, landing/feed, genres, radio, and history resources
- write subset for playlist creation, playlist metadata mutations, playlist item insert/delete/move, expanded playlist helpers, likes/dislikes reads and mutations, and clip likes
- `fetch`-based default transport with OAuth header support
- custom transport injection for tests and advanced runtime integration
- ESM package exports for the root client API and the models subpath

Known gaps:

- not all Yandex Music API models and endpoints are covered yet
- write-heavy flows beyond the current playlists and likes/dislikes support remain outside the current scope, including pins, queue updates, radio feedback, presaves, device auth, and Ynison clients
- no live API integration tests are included, so the test suite does not require secrets or network access
- no CommonJS build is published
- no browser-specific support matrix is documented yet

Published package surface:

- `ya-music-api-ts-lib`
- `ya-music-api-ts-lib/models`

The npm package currently includes only `dist`, `README.md`, `LICENSE`, and `package.json`.

## Project Boundaries

This package is a read-mostly API client focused on typed response parsing, transport behavior, stable package exports, and an explicit write subset for playlists and likes/dislikes.

For machine-readable integration guidance, see [LLM Usage Map](docs/LLM.md).

## Checkpoints

Current checkpoints:

- [x] ESM npm package metadata
- [x] Strict TypeScript build
- [x] Zero runtime dependencies
- [x] `fetch` transport with OAuth support
- [x] Read-only resources for account, tracks, albums, playlists, search, artists, landing/feed, genres, radio, and history
- [x] Read-only parity helpers for search suggestions, music history items, artist metadata, and feed wizard status
- [x] Playlist mutation support and playlist item modifications
- [x] Likes/dislikes reads and mutations, including clip likes
- [x] Node.js, Bun, and Deno smoke tests
- [x] Package contract tests

Remaining checkpoints:

- [ ] Continue remaining model parity alongside the current mutation surface
- [ ] Add opt-in live integration tests
- [ ] Document browser/runtime support and stabilize error/transport docs
- [ ] Expand write-heavy flows with queue updates, radio feedback, pins, presaves, and adjacent mutation resources
- [ ] Freeze the stable public API, compatibility policy, changelog, and release process

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
const suggestions = await client.search.searchSuggest("mus", {
  language: "en",
});
const artistLinks = await client.artists.links(7015718, {
  language: "en",
});
const historyItems = await client.history.musicHistoryItems({
  trackIds: [{ trackId: 11, albumId: 22 }],
});

const playlist = await client.playlists.create(501, {
  title: "Road Mix",
  visibility: "private",
});

await client.playlists.insertTrack(501, playlist.kind ?? 100, {
  albumId: 22,
  revision: playlist.revision ?? 1,
  trackId: 11,
});

await client.likes.addTracks(["11:22"], {
  userId: 501,
});

const likedTracks = await client.likes.likedTracks(501);
const recommendations = await client.playlists.recommendations(501, playlist.kind ?? 100);
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

## Model Parity

The project tracks read-only model coverage against [MarshalX/yandex-music-api](https://github.com/MarshalX/yandex-music-api/tree/main/yandex_music).

See [Model Parity](docs/model-parity.md) for the current local coverage table and explicit exclusions.

Model parity here means typed parsing of API response shapes and practical nested model coverage.

## LLM Usage Map

AI agents and automation that connect this library inside another application should start with [LLM Usage Map](docs/LLM.md).

It documents:

- package entrypoints and runtime assumptions
- OAuth and client construction
- resource methods and common usage examples
- models, error handling, and custom transport injection
- integration checklist for tests and automation

This repository was made possible by the prior work in [MarshalX/yandex-music-api](https://github.com/MarshalX/yandex-music-api/tree/main/yandex_music), which served as the implementation reference for translating proven Yandex Music API behavior into TypeScript.
Many thanks to MarshalX for that work.

## Release Validation

The GitHub Actions workflow runs only when a new release tag is pushed.
It validates typecheck, Node tests, Bun smoke tests, Deno smoke tests, and `npm pack --dry-run`.

## Development

Agents integrating this package should use [LLM Usage Map](docs/LLM.md). Contributors working on this repository can run the local validation commands below.

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

Regenerate the model parity report after adding or removing model files:

```fish
node scripts/model-parity.mjs
```
