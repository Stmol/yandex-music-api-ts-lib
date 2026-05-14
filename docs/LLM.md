# LLM Usage Map

This file is a machine-oriented usage guide for agents that consume `ya-music-api-ts-lib` inside another TypeScript project.

Policy references:

- Runtime and browser compatibility: [runtime-compatibility.md](./runtime-compatibility.md)
- Error and transport behavior: [error-transport-contract.md](./error-transport-contract.md)
- Compatibility guarantees: [compatibility-policy.md](./compatibility-policy.md)
- Release checklist: [release-process.md](./release-process.md)
- Planned stable release notes: [../CHANGELOG.md](../CHANGELOG.md)

## Package

- Package: `ya-music-api-ts-lib`
- Models subpath: `ya-music-api-ts-lib/models`
- Module format: ESM only
- Runtime dependencies: none
- Stable runtime baseline: Node.js `>=22`, Bun `>=1.1`
- Verified compatibility: Deno `2.x` via ESM imports and the runtime smoke test
- Browser support: available only in fetch-compatible environments, but not part of the CI release gate yet
- Authentication: pass a Yandex Music OAuth token as `oauthToken`

```ts
import { YandexMusicClient } from "ya-music-api-ts-lib";

const client = new YandexMusicClient({
  oauthToken: process.env.YANDEX_MUSIC_TOKEN,
});
```

## Client Construction

Use the root export for the API client, error classes, and transport types.

```ts
import {
  AbortError,
  BadRequestError,
  NetworkError,
  NotFoundError,
  TimeoutError,
  UnauthorizedError,
  UnknownApiError,
  YandexMusicClient,
  YandexMusicError,
  type HttpRequest,
  type HttpResponse,
  type HttpTransport,
} from "ya-music-api-ts-lib";
```

Constructor options:

- `oauthToken` - bearer token for Yandex Music API requests.
- `baseUrl` - override API base URL.
- `defaultHeaders` - headers added to every request.
- `defaultTimeoutMs` - default request timeout. Library default: `10_000`.
- `defaultRetry` - retry policy for the built-in fetch transport.
- `fetch` - custom fetch-compatible function. Use this when the host runtime provides `fetch` through a wrapper.
- `transport` - full custom `HttpTransport`; when set, built-in fetch behavior is bypassed entirely.

## Transport Contract

`HttpRequest` must contain exactly one of:

- `path` - resolved against `https://api.music.yandex.net`
- `url` - used as-is

Other request fields:

- `method` defaults to `GET`
- `query` supports string, number, boolean, null, undefined, and arrays of those values
- `oauthToken` overrides the constructor token for one request
- `signal` supports external cancellation
- `timeoutMs` overrides the constructor timeout for one request
- `retry` overrides the constructor retry policy for one request

Built-in `FetchTransport` behavior:

- sends `Accept: application/json` by default
- injects `Authorization: OAuth <token>` when a token is available and the request did not already define `authorization`
- retries only idempotent methods by default: `GET`
- retries only on `408`, `425`, `429`, `500`, `502`, `503`, `504`
- default retry values: `maxRetries=2`, `baseDelayMs=250`, `maxDelayMs=2000`
- respects `Retry-After` when present
- does not retry malformed JSON responses
- does not retry aborts or non-idempotent methods unless the caller changes the retry policy

Custom transport shape:

```ts
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

const client = new YandexMusicClient({ transport: new MockTransport() });
```

## Resource Map

`YandexMusicClient` exposes immutable resource objects:

- `client.account`
- `client.albums`
- `client.artists`
- `client.genres`
- `client.history`
- `client.landing`
- `client.likes`
- `client.playlists`
- `client.radio`
- `client.search`
- `client.tracks`

Common option fields:

- `language`: `"ru" | "en" | "uk" | "kk" | "be"`
- `page`, `pageSize`: pagination where supported
- IDs accept `string | number` unless a method documents a narrower shape

## Account

```ts
const status = await client.account.status({ language: "en" });
const uid = status.account?.uid;
const hasPlus = status.hasActiveSubscription;
```

Returns `Status`.

## Tracks

```ts
const tracks = await client.tracks.byIds(["11:22", "33:44"], {
  language: "en",
  withPositions: true,
});

const downloadInfo = await client.tracks.downloadInfo("11:22", {
  getDirectLinks: true,
});

const supplement = await client.tracks.supplement("11:22");
const lyrics = await client.tracks.lyrics("11:22", { format: "TEXT" });
const similar = await client.tracks.similar("11:22");
const trailer = await client.tracks.trailer("11:22");
const fullInfo = await client.tracks.fullInfo("11:22");
```

Returns model instances such as `Track`, `DownloadInfo`, `Supplement`, `TrackLyrics`, `SimilarTracks`, `TrackTrailer`, and `TrackFullInfo`.

## Albums

```ts
const albums = await client.albums.byIds([1, 2], { language: "en" });
const album = await client.albums.withTracks(1);
const similar = await client.albums.similarEntities(1);
const trailer = await client.albums.trailer(1);
```

Returns `Album`, `AlbumSimilarEntities`, or `AlbumTrailer`.

## Artists

```ts
const artists = await client.artists.byIds([7015718]);
const brief = await client.artists.briefInfo(7015718);
const tracks = await client.artists.tracks(7015718, { page: 0, pageSize: 20 });
const albums = await client.artists.albums(7015718);
const directAlbums = await client.artists.directAlbums(7015718);
const alsoAlbums = await client.artists.alsoAlbums(7015718);
const discography = await client.artists.discographyAlbums(7015718);
const safeDirect = await client.artists.safeDirectAlbums(7015718, { limit: 10 });
const similar = await client.artists.similar(7015718);
const links = await client.artists.links(7015718);
const info = await client.artists.info(7015718);
const trackIds = await client.artists.trackIds(7015718);
```

Returns `Artist`, `BriefInfo`, `ArtistTracks`, `ArtistAlbums`, `ArtistSimilar`, `ArtistLinks`, `ArtistInfo`, or string track IDs.

## Search

```ts
const search = await client.search.search("Muse", {
  type: "track",
  page: 0,
  pageSize: 10,
  language: "en",
});

const suggestions = await client.search.searchSuggest("mus", {
  language: "en",
});
```

`SearchOptions.type` accepts `"all" | "album" | "artist" | "playlist" | "track"`.

## Landing, Feed, Genres

```ts
const landing = await client.landing.landing(["new-releases", "chart"], {
  language: "en",
});

const chart = await client.landing.chart();
const chartByOption = await client.landing.chart("world");
const newReleases = await client.landing.newReleases();
const newPlaylists = await client.landing.newPlaylists();
const podcasts = await client.landing.podcasts();
const tag = await client.landing.tags("rock");
const feed = await client.landing.feed();
const wizardPassed = await client.landing.feedWizardIsPassed();
const genres = await client.genres.list({ language: "en" });
```

## Playlists

Read helpers:

```ts
const userPlaylists = await client.playlists.list(501);
const playlist = await client.playlists.get(501, 100, { richTracks: true });
const batch = await client.playlists.byKinds(501, [100, 101]);
const recommendations = await client.playlists.recommendations(501, 100);
const byUuid = await client.playlists.byUuid("playlist-uuid");
const similar = await client.playlists.similarEntities("playlist-uuid");
const publicList = await client.playlists.byIds(["501:100", "502:200"]);
const shortList = await client.playlists.listShort(["501:100", "502:200"]);
const personal = await client.playlists.personal("daily");
const trailer = await client.playlists.trailer(501, 100);
const kinds = await client.playlists.kinds(501);
```

Mutation helpers require a valid OAuth token and the owner `userId`:

```ts
const created = await client.playlists.create(501, {
  title: "Road Mix",
  visibility: "private",
});

const renamed = await client.playlists.rename(501, created.kind ?? 100, "New title");
const visible = await client.playlists.setVisibility(501, created.kind ?? 100, "public");
const described = await client.playlists.setDescription(501, created.kind ?? 100, "Description");

const changed = await client.playlists.insertTrack(501, created.kind ?? 100, {
  albumId: 22,
  revision: created.revision ?? 1,
  trackId: 11,
});

const moved = await client.playlists.moveTrack(501, created.kind ?? 100, {
  albumId: 22,
  at: 3,
  from: 0,
  revision: changed.revision ?? 2,
  trackId: 11,
});

const deletedTracks = await client.playlists.deleteTracks(501, created.kind ?? 100, {
  from: 0,
  to: 0,
  revision: moved.revision ?? 3,
});

const joined = await client.playlists.collectiveJoin(501, "collective-token");
const deleted = await client.playlists.delete(501, created.kind ?? 100);
```

Raw diff helper:

```ts
import { PlaylistDiffBuilder } from "ya-music-api-ts-lib";

const diff = new PlaylistDiffBuilder()
  .insert(0, { id: 11, albumId: 22 })
  .delete(3, 4)
  .toJSON();

await client.playlists.change(501, 100, {
  diff,
  revision: 5,
});
```

## Likes And Dislikes

Read liked/disliked collections:

```ts
const likedTracks = await client.likes.likedTracks(501, {
  ifModifiedSinceRevision: 0,
});

const likedAlbums = await client.likes.likedAlbums(501, { rich: true });
const likedArtists = await client.likes.likedArtists(501, { withTimestamps: true });
const likedPlaylists = await client.likes.likedPlaylists(501);

const dislikedTracks = await client.likes.dislikedTracks(501);
const dislikedArtists = await client.likes.dislikedArtists(501);

const likedClips = await client.likes.likedClips(501, {
  page: 0,
  pageSize: 100,
});
```

Mutate likes:

```ts
await client.likes.addTracks(["11:22"], { userId: 501 });
await client.likes.removeTracks(["11:22"], { userId: 501 });

await client.likes.addAlbums([1, 2], { userId: 501 });
await client.likes.removeAlbums([1], { userId: 501 });

await client.likes.addArtists([7015718], { userId: 501 });
await client.likes.removeArtists([7015718], { userId: 501 });

await client.likes.addPlaylists(["501:100"], { userId: 501 });
await client.likes.removePlaylists(["501:100"], { userId: 501 });

await client.likes.addClip("clip-id", { userId: 501 });
await client.likes.removeClip("clip-id", { userId: 501 });
```

Mutate dislikes:

```ts
await client.likes.addTrackDislikes(["11:22"], { userId: 501 });
await client.likes.removeTrackDislikes(["11:22"], { userId: 501 });

await client.likes.addArtistDislikes([7015718], { userId: 501 });
await client.likes.removeArtistDislikes([7015718], { userId: 501 });
```

## History

```ts
const history = await client.history.musicHistory({
  fullModelsCount: 10,
  language: "en",
});

const items = await client.history.musicHistoryItems({
  trackIds: [{ trackId: 11, albumId: 22 }],
  albumIds: [22],
  artistIds: [7015718],
  playlistIds: [{ uid: 501, kind: 100 }],
});
```

## Radio

```ts
const accountStatus = await client.radio.accountStatus();
const dashboard = await client.radio.stationsDashboard();
const stations = await client.radio.stationsList();
const info = await client.radio.stationInfo("user:onyourwave");
const tracks = await client.radio.stationTracks("user:onyourwave", {
  queue: "queue-id",
  settings2: true,
});
```

## Models

All models are exported from the root package and from `ya-music-api-ts-lib/models`.

```ts
import { Track, Album, Artist, Playlist } from "ya-music-api-ts-lib/models";

const track = Track.fromJSON({ id: 1, title: "Song" });
```

Model behavior:

- API `snake_case` fields are normalized to top-level `camelCase`
- fields are intentionally optional because Yandex Music payloads vary by endpoint
- nested known entities are parsed into model instances where the library has a model
- unknown fields are preserved on the model object when they appear in the normalized shape
- treat model instances as read-only data

Useful model families:

- Account: `Status`, `UserSettings`, `Subscription`, `Product`
- Music entities: `Track`, `Album`, `Artist`, `Playlist`
- Playlist helpers: `PlaylistsList`, `PlaylistRecommendations`, `PlaylistSimilarEntities`, `PlaylistTrailer`
- Likes: `Like`, `TracksList`, `ClipsWillLike`
- Search: `Search`, `Suggestions`
- Landing/feed: `Landing`, `LandingList`, `ChartInfo`, `Feed`
- Radio: `Dashboard`, `StationResult`, `StationTracksResult`
- Shared: `DownloadInfo`, `TrackShort`, `Pager`, `TrailerInfo`

## Error Handling

The HTTP layer unwraps Yandex Music API response envelopes and throws typed errors.

```ts
try {
  await client.tracks.byIds(["bad-id"]);
} catch (error) {
  if (error instanceof UnauthorizedError) {
    // Refresh or replace OAuth token.
  } else if (error instanceof NotFoundError) {
    // Requested API object was not found.
  } else if (error instanceof BadRequestError) {
    // Request shape or id value was rejected.
  } else if (error instanceof TimeoutError) {
    // The built-in timeout expired.
  } else if (error instanceof AbortError) {
    // The caller cancelled the request.
  } else if (error instanceof NetworkError) {
    // Fetch failed before an HTTP response was produced.
  } else if (error instanceof UnknownApiError) {
    // Non-mapped API or response parsing failure.
  } else if (error instanceof YandexMusicError) {
    // Other library-level typed failure.
  }
}
```

Exported error classes:

- `YandexMusicError`
- `BadRequestError`
- `UnauthorizedError`
- `NotFoundError`
- `UnknownApiError`
- `ApiSchemaError`
- `NetworkError`
- `TimeoutError`
- `AbortError`

Each typed error may include:

- `status` for HTTP-aware failures
- `url` for the resolved request URL when available
- `details` for API payloads or malformed response bodies
- `cause` when the failure wraps an underlying runtime error

## Runtime Notes

- The package is ESM-only. Use `import`, not `require`.
- The package does not publish a CommonJS build.
- The package does not manage OAuth token acquisition.
- The default transport depends on `fetch`, `URL`, `Headers`, `Request`, `Response`, `AbortController`, and timers from the host runtime.
- Browser usage is acceptable only when the application is comfortable exposing the OAuth token to that environment and can tolerate the lack of browser CI coverage.
- Mutation methods call real Yandex Music write endpoints. Do not run them in tests or automation unless the caller intentionally wants account changes.

## Import Checklist For Agents

1. Install `ya-music-api-ts-lib`.
2. Read OAuth token from the host app's secret store or environment.
3. Prefer server-side integration for production credentials.
4. Construct one `YandexMusicClient` per token/configuration.
5. Use resource methods instead of constructing API URLs manually.
6. Use returned model fields with optional chaining.
7. Catch `YandexMusicError` or narrower subclasses at integration boundaries.
8. For tests, inject a custom `HttpTransport` instead of calling live Yandex Music endpoints.
