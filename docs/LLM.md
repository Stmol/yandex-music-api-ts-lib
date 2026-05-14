# LLM Project Map

This file is a compact orientation guide for AI coding agents working in this repository.

## Project In One Sentence

`ya-music-api-ts-lib` is a zero-dependency ESM TypeScript client for read-mostly Yandex Music API usage, with handwritten models, a fetch-based HTTP transport, a small explicit v0.5 write subset, and smoke tests for Node.js, Bun, and Deno.

## Hard Boundaries

- Keep write-heavy API flows out of scope unless they are part of the explicit v0.5 write subset: playlist mutations and likes/dislikes mutations are supported; pins, queue updates, radio feedback, presaves, device auth, and Ynison websocket clients remain out of scope.
- Keep the package zero-runtime-dependency.
- Do not add live write tests to the default suite. Write methods are covered with mock transports and must not require OAuth tokens, secrets, or network access.

## Public Package Surface

- Root package: `ya-music-api-ts-lib`
- Models subpath: `ya-music-api-ts-lib/models`
- Package type: ESM only
- Runtime dependencies: none
- Supported runtime baseline:
  - Node.js `>=22`
  - Bun `>=1.1`
  - Deno smoke-tested via local tests

Main user entrypoint:

```ts
import { YandexMusicClient } from "ya-music-api-ts-lib";

const client = new YandexMusicClient({
  oauthToken: process.env.YANDEX_MUSIC_TOKEN,
});

const status = await client.account.status({ language: "en" });
const tracks = await client.tracks.byIds(["11:22"]);
const suggestions = await client.search.searchSuggest("muse");
```

Models can also be used directly:

```ts
import { Track, Album, Artist } from "ya-music-api-ts-lib/models";

const track = Track.fromJSON({ id: 1, title: "Song" });
```

## Architecture Map

### `src/client.ts`

Defines `YandexMusicClient`. It creates and freezes resource instances:

- `account`
- `albums`
- `artists`
- `genres`
- `history`
- `landing`
- `likes`
- `playlists`
- `radio`
- `search`
- `tracks`

If `options.transport` is provided, the client uses it. Otherwise it creates `FetchTransport`.

### `src/client-options.ts`

Defines client constructor options: OAuth token, base URL, custom fetch, headers, timeout, retry policy, and custom transport.

### `src/http/*`

HTTP layer:

- `types.ts` - transport/request/response types.
- `fetch-transport.ts` - default transport using runtime `fetch`.
- `response.ts` - API envelope/error parsing.
- `constants.ts` - defaults.

Agents adding endpoints should use `HttpTransport.request()` and resource parsing helpers, not call `fetch` directly.

### `src/resources/*`

Resource layer. Each file maps methods to API paths and query parameters, then parses responses into models.

Current read-mostly resources:

- `account.ts`
- `albums.ts`
- `artists.ts`
- `genres.ts`
- `history.ts`
- `landing.ts`
- `likes.ts`
- `playlists.ts`
- `radio.ts`
- `search.ts`
- `tracks.ts`

Resource pattern:

```ts
const response = await this.transport.request({
  method: "GET",
  path: "/some/path",
  query: { lang: options.language },
});

return SomeModel.fromJSON(parseObjectResult(response));
```

Write resource methods use the same `HttpTransport.request()` API with `POST` and `BodyInit` payloads. Playlist and likes/dislikes mutations use form-encoded request bodies matching the MarshalX endpoint behavior; music history items use JSON.

Use helpers from `src/resources/parsing.ts`:

- `parseObjectResult`
- `parseObjectArrayResult`
- `parsePrimitiveResult`

### `src/models/*`

Model layer. Models are read-only parsers for API response shapes.

Current families include:

- `account`
- `album`
- `artist`
- `clip`
- `concert`
- `feed`
- `genre`
- `history`
- `label`
- `landing`
- `metatag`
- `playlist`
- `queue`
- `radio`
- `search`
- `shared`
- `shot`
- `skeleton`
- `track`
- `wave`

Most model classes follow this pattern:

```ts
import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject } from "../../core/parsing.ts";

export interface ExampleShape extends Record<string, unknown> {
  id?: string | number;
  title?: string;
}

export class Example {
  declare readonly id?: string | number;
  declare readonly title?: string;

  constructor(shape: ExampleShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends Example>(
    this: new (shape: ExampleShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    return new this(normalizeObject(json));
  }
}
```

For nested models, use helpers from `src/core/parsing.ts`:

- `parseOptionalJsonObject`
- `parseOptionalJsonObjectArray`
- `expectJsonObject`
- `normalizeObject`

Nested parsing examples:

- `Landing.fromJSON()` parses `blocks` into `Block[]`.
- `Block.fromJSON()` parses `entities` into `BlockEntity[]`.
- `BlockEntity.fromJSON()` parses `data` into `Album`, `Artist`, `Playlist`, or `Track` based on `type`.
- `Feed.fromJSON()` parses `days` into `Day[]` and `events` into `Event[]`.
- `PlaylistSimilarEntities.fromJSON()` parses nested playlists, albums, artists, and tracks.

### `src/core/*`

Shared primitives:

- `errors.ts` - typed error classes.
- `identifiers.ts` - domain id aliases and id serialization helpers.
- `json.ts` - JSON type definitions.
- `model.ts` - `assignModelShape`.
- `normalize.ts` - snake_case to camelCase top-level key normalization.
- `parsing.ts` - schema assertions and nested parsing helpers.

## Export Rules

### Root Export

`src/index.ts` exports:

- `YandexMusicClient`
- client/options/http/error/resource types
- all models via `export * from "./models/index.js"`

Be careful with model names that collide with root domain types. Example: the landing model `TrackId` is exported from `src/models/index.ts` as `LandingTrackId` to avoid colliding with the root domain type `TrackId`.

### Models Export

`src/models/index.ts` is the barrel for `ya-music-api-ts-lib/models`.

When adding a model:

1. Add the model file under the correct `src/models/<family>/` folder.
2. Export it from `src/models/index.ts`.
3. If the class name collides with an existing public type/class, alias it.
4. Add a representative package contract or runtime smoke test if the model is part of a new family.

## Tests Map

- `tests/core` - model parsing, type behavior, core helpers.
- `tests/http` - transport and response parsing.
- `tests/resources` - resource path/query serialization and model parsing.
- `tests/runtime` - Node/Bun/Deno import smoke tests.
- `tests/meta` - package metadata and export contract.

Important test files:

- `tests/core/read-only-models.test.ts` - broad model parser coverage.
- `tests/core/model-parity.test.ts` - model parity report guardrails.
- `tests/meta/package-contract.test.ts` - package and representative model export checks.
- `tests/runtime/node-smoke.test.ts` - Node import/runtime smoke.

## Common Commands

Use fish shell.

```fish
npm run lint
npm run check:types
npm run check:dead-code
npm run test:meta
npm run test:node
npm run test:bun
npm run test:deno
npm pack --dry-run
```

Full local validation:

```fish
npm run check
```

Build only:

```fish
npm run build
```

Compile tests only:

```fish
npm run build:tests
```

## Adding A New Read-only Endpoint

1. Find the matching resource file in `src/resources`.
2. Add option types near similar methods.
3. Add a method that calls `this.transport.request()`.
4. Use an existing path/query serialization pattern.
5. Parse with `parseObjectResult`, `parseObjectArrayResult`, or a primitive helper.
6. Return model instances, not raw JSON, when a model exists.
7. Add a `tests/resources/*.test.ts` case asserting:
   - path
   - method
   - query parameters
   - returned model type
   - at least one useful normalized field
8. Do not add live-network tests unless explicitly requested.

## Adding A New Model

1. Place it under `src/models/<family>/`.
2. Use `fromJSON` and `normalizeObject`.
3. Keep fields optional unless the API shape is guaranteed.
4. Prefer broad read-only shape support over strict schemas for unstable upstream responses.
5. Add nested parsing only where the nested model is known and useful.
6. Export from `src/models/index.ts`.
7. Add parser assertions in `tests/core/read-only-models.test.ts`.
8. Run `npm run lint`, `npm run check:types`, and `npm run test:node`.

## Model Parity

The project tracks read-only model coverage against:

`https://github.com/MarshalX/yandex-music-api/tree/main/yandex_music`

Local parity artifacts:

- `docs/model-parity.md`
- `scripts/model-parity.mjs`

Regenerate the report:

```fish
node scripts/model-parity.mjs
```

The parity goal means typed parsing of API response shapes and useful nested model coverage. Device auth, websocket clients, and write-heavy resource families are still separate concerns.

## v0.4 Milestone

The v0.4 release completed a read-only model parity wave. Newly covered or expanded families include:

- `clip`
- `concert`
- `label`
- `metatag`
- `shot`
- `skeleton`
- `wave`
- expanded `account`, `artist`, `feed`, `history`, `landing`, `playlist`, `radio`, `track`, and `shared`

Still partial or intentionally deferred areas are tracked in `docs/model-parity.md`.

## v0.5 Milestone

The v0.5 release introduces the first supported write surface while keeping the client read-mostly:

- playlist creation, deletion, rename, visibility, description, raw `change`, track insertion, and track range deletion
- playlist diff helpers via `PlaylistDiffBuilder` and `serializePlaylistDiff`
- likes/dislikes mutations for tracks, albums, artists, and playlists where supported by the API
- mock-transport tests for request path, form body serialization, response parsing, and public exports

Still out of scope: pins, queue updates, radio feedback, presaves, device auth, Ynison websocket clients, and live integration tests in the default suite.

## Do Not Accidentally Break These Contracts

- `package.json` `dependencies` must stay `{}`.
- `package.json` `files` must stay limited to `dist`, `README.md`, and `LICENSE` unless intentionally changing package contents.
- Root and models exports must keep compiling under ESM.
- `YandexMusicClient` must remain immutable after construction.
- Tests must not require OAuth tokens, secrets, or live network access.
- No CommonJS build is currently published.

## Quick Orientation Checklist For Agents

Before editing:

1. Read this file.
2. Check `git status --short`.
3. Identify whether the task touches models, resources, HTTP, packaging, or docs.
4. Locate the nearest existing pattern and follow it.
5. Preserve the current package scope and zero-dependency runtime contract.

Before finishing:

1. Run the smallest relevant test first.
2. Run `npm run lint`.
3. Run `npm run check:types`.
4. Run `npm run test:node`.
5. If packaging/export surface changed, run `npm run test:meta` and `npm pack --dry-run`.
6. Report any commands that could not run.
