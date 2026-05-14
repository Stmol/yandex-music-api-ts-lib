# ya-music-api-ts-lib

[![CI](https://github.com/Stmol/yandex-music-api-ts-lib/actions/workflows/ci.yml/badge.svg)](https://github.com/Stmol/yandex-music-api-ts-lib/actions/workflows/ci.yml)
[![Zero runtime dependencies](https://img.shields.io/badge/runtime%20dependencies-0-2ea44f)](#runtime-compatibility)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](#license)
[![Bun](https://img.shields.io/badge/Bun-1.1%2B-f9f1e1?logo=bun&logoColor=000000)](#runtime-compatibility)
[![Deno](https://img.shields.io/badge/Deno-2.x-000000?logo=deno&logoColor=white)](#runtime-compatibility)

Zero-dependency TypeScript package for the Yandex Music API.

## Status

This repository is released as `v1.1.0`.

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
- release validation workflow for lint, typecheck, dead-code checks, runtime smoke tests, and package dry-run
- documented runtime compatibility, error/transport contract, compatibility policy, and release process for the stable line

Stable `v1.0.0` scope:

- curated handwritten models for account, artist, album, track, playlist, search, landing, feed, genre, queue, radio, history, and shared read-only shapes
- expanded read-only models for nested track metadata, album volumes/trailers/similar entities, artist brief/tracks/albums/similar results, landing lists/chart/tag results, genres, radio station results, and music history
- read-only model parity wave covering clip, concert, label, metatag, shot, skeleton, wave, and expanded nested account/artist/album/landing/playlist/radio/history/track shapes
- read-only account, tracks, albums, playlists, search, artists, landing/feed, genres, radio, and history resources
- write subset for playlist creation, playlist metadata mutations, playlist item insert/delete/move, expanded playlist helpers, likes/dislikes reads and mutations, and clip likes
- `fetch`-based default transport with OAuth header support
- custom transport injection for tests and advanced runtime integration
- ESM package exports for the root client API and the models subpath

Known gaps:

- **No CommonJS build** is published.
- **No browser CI smoke test** is part of the release gate yet.
- **Live integration tests are opt-in**: they exist for local/manual release confidence, but they are not part of the default PR gate.

Published package surface:

- `ya-music-api-ts-lib`
- `ya-music-api-ts-lib/models`

Deep imports from internal package paths are not part of the public API contract.

The npm package currently includes only `dist`, `README.md`, and `LICENSE` in addition to `package.json`.

## Project Boundaries

This package is a read-mostly API client focused on typed response parsing, transport behavior, stable package exports, and an explicit write subset for playlists and likes/dislikes.

For machine-readable integration guidance, see [LLM Usage Map](docs/LLM.md).

## Runtime Compatibility

Stable runtime baseline:

- Node.js `>=22`
- Bun `>=1.1`

Verified compatibility:

- Deno `2.x` through the repository smoke test

Best-effort compatibility:

- browser and edge runtimes with standards-compatible `fetch`, `URL`, `Headers`, `Request`, `Response`, `AbortController`, and timers

Important caveat: browser support is documented, but it is not yet part of the CI release gate. Treat it as an application-owned integration choice, especially because OAuth token handling in browsers may be unacceptable for many production setups.

Full policy: [docs/runtime-compatibility.md](docs/runtime-compatibility.md)

## Transport And Errors

The built-in transport is `fetch`-based and has a stable documented contract:

- default `Accept: application/json`
- OAuth header injection when a token is provided and `authorization` is not already set
- default timeout: `10_000 ms`
- default retries only for `GET`
- default retriable statuses: `408`, `425`, `429`, `500`, `502`, `503`, `504`
- default retry settings: `maxRetries=2`, `baseDelayMs=250`, `maxDelayMs=2000`
- support for `AbortSignal`, per-request retry overrides, and full `HttpTransport` replacement

Typed exported errors:

- `YandexMusicError`
- `BadRequestError`
- `UnauthorizedError`
- `NotFoundError`
- `UnknownApiError`
- `ApiSchemaError`
- `NetworkError`
- `TimeoutError`
- `AbortError`

Full contract: [docs/error-transport-contract.md](docs/error-transport-contract.md)

## Compatibility Policy

Starting with `v1.0.0`, the project intends to follow semantic versioning for:

- root and models entrypoints
- exported TypeScript API
- documented `YandexMusicClient` options and resource names
- documented transport and error behavior
- published runtime baselines

Policy details: [docs/compatibility-policy.md](docs/compatibility-policy.md)

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
- [x] Runtime/browser documentation
- [x] Error/transport contract documentation
- [x] Compatibility policy
- [x] Release process documentation
- [x] Changelog entry for `v1.0.0`
- [x] Opt-in live integration tests

Remaining checkpoints:

- [ ] Continue remaining model parity alongside the current mutation surface
- [ ] Add browser CI coverage if browser support should become release-gated
- [ ] Expand write-heavy flows with queue updates, radio feedback, pins, presaves, and adjacent mutation resources

## Installation

### Node.js

```fish
npm install ya-music-api-ts-lib
```

### Bun

```fish
bun add ya-music-api-ts-lib
```

### Deno

```fish
deno add npm:ya-music-api-ts-lib
```

Import it in Deno through the npm specifier:

```ts
import { YandexMusicClient } from "npm:ya-music-api-ts-lib";
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

## API Coverage

| Group | Read | Write |
|---|---|---|
| **Account** | `status` | — |
| **Tracks** | `byIds`, `downloadInfo`, `supplement`, `lyrics`, `similar`, `trailer`, `fullInfo` | — |
| **Albums** | `byIds`, `withTracks`, `similarEntities`, `trailer` | — |
| **Artists** | `byIds`, `briefInfo`, `tracks`, `albums` (x5 sort variants), `similar`, `links`, `info`, `trackIds` | — |
| **Search** | `search` (type filter: all/album/artist/playlist/track), `searchSuggest` | — |
| **Landing / Feed** | `landing`, `chart`, `newReleases`, `newPlaylists`, `podcasts`, `tags`, `feed`, `feedWizardIsPassed` | — |
| **Genres** | `list` | — |
| **Playlists** | `list`, `get`, `byKinds`, `recommendations`, `byUuid`, `similarEntities`, `byIds`, `listShort`, `personal`, `trailer`, `kinds` | `create`, `delete`, `rename`, `setVisibility`, `setDescription`, `change`, `insertTrack`, `deleteTracks`, `moveTrack`, `moveTracks`, `collectiveJoin`, `PlaylistDiffBuilder` |
| **Likes / Dislikes** | `likedTracks`, `likedAlbums`, `likedArtists`, `likedPlaylists`, `likedClips`, `dislikedTracks`, `dislikedArtists` | `addTracks` / `removeTracks`, `addAlbums` / `removeAlbums`, `addArtists` / `removeArtists`, `addPlaylists` / `removePlaylists`, `addClip` / `removeClip`, `addTrackDislikes` / `removeTrackDislikes`, `addArtistDislikes` / `removeArtistDislikes` |
| **Radio** | `accountStatus`, `stationsDashboard`, `stationsList`, `stationInfo`, `stationTracks` | — |
| **History** | `musicHistory`, `musicHistoryItems` | — |

**Transport:** `fetch`-based with OAuth header injection, configurable retry policy, 10s timeout, `Retry-After` support, `AbortSignal` support, and custom `HttpTransport` injection for testing.

**Total:** about 60 methods across 11 resource groups.

## LLM Usage Map

AI agents and automation that connect this library inside another application should start with [LLM Usage Map](docs/LLM.md).

It documents:

- package entrypoints and runtime assumptions
- OAuth and client construction
- resource methods and common usage examples
- models, error handling, and custom transport injection
- integration checklist for tests and automation

## Changelog And Release Process

- Changelog: [CHANGELOG.md](CHANGELOG.md)
- Release process: [docs/release-process.md](docs/release-process.md)
- Manual live workflow: `.github/workflows/live-tests.yml`

The CI workflow runs on pull requests, branch pushes, and tags matching `v*`.
The default CI gate verifies lint, typecheck, dead-code checks, Node tests, package-contract tests, Bun smoke tests, Deno smoke tests, and `npm pack --dry-run`.
Opt-in live integration tests run separately through `npm run test:live` or the manual GitHub Actions workflow.

## Acknowledgements

This repository was made possible by the prior work in [MarshalX/yandex-music-api](https://github.com/MarshalX/yandex-music-api/tree/main/yandex_music), which served as the implementation reference for translating proven Yandex Music API behavior into TypeScript.

Many thanks to MarshalX for that work.

## Development

Agents integrating this package should use [LLM Usage Map](docs/LLM.md). Contributors working on this repository can run the local validation commands below.

```fish
npm run check:types
npm run build
npm run build:tests
npm run test:meta
npm run test:node
npm run test:live
npm run test:bun
npm run test:deno
npm pack --dry-run
```

Local live test env:

```fish
set -x YANDEX_MUSIC_LIVE 1
set -x YANDEX_MUSIC_OAUTH_TOKEN <oauth-token>
npm run test:live
```

Optional mutation smoke:

```fish
set -x YANDEX_MUSIC_LIVE_MUTATION 1
set -x YANDEX_MUSIC_TEST_USER_ID <uid>
npm run test:live
```

For the full release gate, see [docs/release-process.md](docs/release-process.md).

Regenerate the model parity report after adding or removing model files:

```fish
node scripts/model-parity.mjs
```

## License

MIT
