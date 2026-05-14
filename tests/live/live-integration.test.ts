import assert from "node:assert/strict";
import test from "node:test";

import {
  Playlist,
  Search,
  StationTracksResult,
  Status,
  Track,
  YandexMusicClient,
  type ArtistId,
  type RadioStationId,
  type TrackId,
  type UserId,
} from "../../src/index.ts";
import {
  configuredTestUserId,
  liveMutationEnabled,
  liveOauthToken,
  liveTestsEnabled,
  requiredEnvSummary,
} from "./live-test-env.ts";

const client = new YandexMusicClient({
  ...(liveOauthToken ? { oauthToken: liveOauthToken } : {}),
  defaultTimeoutMs: 10_000,
});

function getResolvedUserId(status: Status): UserId {
  const userId = configuredTestUserId ?? status.account?.uid;

  assert.ok(
    typeof userId === "string" || typeof userId === "number",
    "Set YANDEX_MUSIC_TEST_USER_ID because live /account/status may not expose account.uid",
  );
  return userId;
}

function getFirstTrackId(search: Search): TrackId {
  const bestTrack = search.best?.result;

  if (bestTrack instanceof Track && (typeof bestTrack.id === "string" || typeof bestTrack.id === "number")) {
    return bestTrack.id;
  }

  const firstTrack = search.tracks?.items?.[0];

  assert.ok(firstTrack !== undefined, "track search must return at least one track item");
  assert.ok(
    typeof firstTrack.id === "string" || typeof firstTrack.id === "number",
    "track search result must expose an id",
  );

  return firstTrack.id;
}

function getFirstArtistId(search: Search): ArtistId {
  const firstArtist = search.artists?.items?.[0];

  assert.ok(firstArtist !== undefined, "artist search must return at least one artist");
  assert.ok(
    typeof firstArtist.id === "string" || typeof firstArtist.id === "number",
    "artist search result must expose an id",
  );

  return firstArtist.id;
}

function getStationId(stationId: string | null | undefined): RadioStationId {
  assert.ok(typeof stationId === "string", "radio.stationsList station must expose stationId");
  return stationId;
}

function getMutationUserId(status: Status): UserId {
  return getResolvedUserId(status);
}

test("live suite is opt-in and requires a token", {
  skip: liveTestsEnabled && liveOauthToken ? false : requiredEnvSummary(),
}, async () => {
  const status = await client.account.status({ language: "en" });
  const userId = getResolvedUserId(status);

  assert.equal(status instanceof Status, true);
  assert.ok(status.account, "account.status must return account metadata");

  const trackSearch = await client.search.search("Muse", {
    language: "en",
    pageSize: 1,
    type: "track",
  });

  assert.equal(trackSearch instanceof Search, true);
  assert.equal(trackSearch.hasResults, true);

  const trackId = getFirstTrackId(trackSearch);
  const tracks = await client.tracks.byIds([trackId], { language: "en" });

  assert.ok(tracks.length > 0, "tracks.byIds must return at least one item");
  assert.ok(tracks[0] instanceof Track);

  const artistSearch = await client.search.search("Muse", {
    language: "en",
    pageSize: 1,
    type: "artist",
  });
  const artistId = getFirstArtistId(artistSearch);
  const artists = await client.artists.byIds([artistId], { language: "en" });

  assert.ok(artists.length > 0, "artists.byIds must return at least one item");

  const playlists = await client.playlists.list(userId, { language: "en" });

  assert.ok(Array.isArray(playlists), "playlists.list must return an array");

  const stations = await client.radio.stationsList({ language: "en" });
  const stationId = getStationId(stations[0]?.station?.stationId);
  const stationInfo = await client.radio.stationInfo(stationId, { language: "en" });

  assert.ok(stationInfo.length > 0, "radio.stationInfo must return at least one station result");

  const stationTracks = await client.radio.stationTracks(stationId, {
    language: "en",
    settings2: true,
  });

  assert.equal(stationTracks instanceof StationTracksResult, true);
});

test("live mutation smoke creates and deletes a dedicated playlist", {
  skip: liveTestsEnabled && liveOauthToken && liveMutationEnabled
    ? false
    : "Mutation smoke is disabled by default.",
}, async () => {
  const status = await client.account.status({ language: "en" });
  const userId = getMutationUserId(status);
  const title = `ya-music-api-ts-lib live smoke ${Date.now()}`;

  let created: Playlist | undefined;

  try {
    created = await client.playlists.create(userId, {
      title,
      visibility: "private",
    });

    assert.equal(created instanceof Playlist, true);
    assert.equal(created.title, title);
    assert.notEqual(created.kind, undefined, "playlists.create must return a kind for cleanup");
  } finally {
    const kind = created?.kind;

    if (kind !== undefined) {
      await client.playlists.delete(userId, kind);
    }
  }
});
