import test from "node:test";
import assert from "node:assert/strict";

import {
  Album,
  Artist,
  Cover,
  Landing,
  MusicHistory,
  Pager,
  Playlist,
  Queue,
  Search,
  Station,
  Status,
  Track,
  TrackShort,
} from "../../src/models/index.ts";

test("shared support models expose practical accessors", () => {
  const cover = Cover.fromJSON({
    uri: "avatars.yandex.net/get-music-content/123/%%",
  });
  const trackShort = TrackShort.fromJSON({
    id: 7,
    title: "Fire",
    version: "Live",
    duration_ms: 215000,
  });
  const pager = Pager.fromJSON({
    page: 2,
    per_page: 10,
    total: 25,
  });

  assert.equal(cover.getUrl("100x100"), "https://avatars.yandex.net/get-music-content/123/100x100");
  assert.equal(trackShort.displayTitle, "Fire (Live)");
  assert.equal(trackShort.durationSeconds, 215);
  assert.equal(pager.hasNextPage, true);
});

test("core entity models parse nested handwritten types", () => {
  const track = Track.fromJSON({
    id: 42,
    title: "Song",
    duration_ms: 180000,
    artists: [
      {
        id: 10,
        name: "Artist Name",
      },
    ],
    albums: [
      {
        id: 20,
        title: "Album Name",
        year: 2025,
      },
    ],
    cover: {
      uri: "avatars.yandex.net/get-music-content/cover/%%",
    },
  });

  const album = Album.fromJSON({
    id: 20,
    title: "Album Name",
    artists: [
      {
        id: 10,
        name: "Artist Name",
      },
    ],
    cover_uri: "avatars.yandex.net/get-music-content/album/%%",
  });

  const artist = Artist.fromJSON({
    id: 10,
    name: "Artist Name",
    cover: {
      uri: "avatars.yandex.net/get-music-content/artist/%%",
    },
  });

  assert.ok(track.artists?.[0] instanceof Artist);
  assert.ok(track.albums?.[0] instanceof Album);
  assert.deepEqual(track.artistsNames, ["Artist Name"]);
  assert.equal(track.getCoverUrl("50x50"), "https://avatars.yandex.net/get-music-content/cover/50x50");
  assert.deepEqual(album.artistNames, ["Artist Name"]);
  assert.equal(album.getCoverUrl("80x80"), "https://avatars.yandex.net/get-music-content/album/80x80");
  assert.equal(artist.getCoverUrl("60x60"), "https://avatars.yandex.net/get-music-content/artist/60x60");
});

test("higher-level models keep curated nested parsing practical", () => {
  const playlist = Playlist.fromJSON({
    kind: 100,
    uid: 200,
    title: "Morning",
    owner: {
      uid: 300,
    },
    cover: {
      uri: "avatars.yandex.net/get-music-content/playlist/%%",
    },
    tracks: [
      {
        id: 1,
        title: "Wake Up",
      },
    ],
  });

  const search = Search.fromJSON({
    text: "wake up",
    best: {
      type: "track",
      result: {
        id: 1,
        title: "Wake Up",
      },
    },
    tracks: {
      items: [
        {
          id: 1,
          title: "Wake Up",
          artists: [{ name: "The Band" }],
        },
      ],
      total: 1,
    },
  });

  const queue = Queue.fromJSON({
    current_index: 1,
    tracks: [
      {
        id: 1,
        title: "First",
      },
      {
        id: 2,
        title: "Second",
      },
    ],
  });

  assert.ok(playlist.tracks?.[0] instanceof TrackShort);
  assert.equal(playlist.ownerUid, 300);
  assert.equal(playlist.getCoverUrl("70x70"), "https://avatars.yandex.net/get-music-content/playlist/70x70");
  assert.equal(search.hasResults, true);
  assert.ok(search.best?.result instanceof Track);
  assert.ok(search.tracks?.items?.[0] instanceof Track);
  assert.equal(queue.currentTrack?.title, "Second");
});

test("status, landing, station, and music history expose user-facing helpers", () => {
  const status = Status.fromJSON({
    plus: {
      has_plus: false,
    },
    permissions: {
      until: "2999-01-01T00:00:00Z",
    },
    account: {
      uid: 501,
      display_name: "Listener",
    },
  });

  const landing = Landing.fromJSON({
    blocks: [
      {
        id: "new-playlists",
        type: "playlists",
        title: "New playlists",
      },
    ],
  });

  const station = Station.fromJSON({
    id: {
      type: "user",
      tag: "nevermore",
    },
    icon: {
      uri: "avatars.yandex.net/get-music-content/station/%%",
    },
  });

  const history = MusicHistory.fromJSON({
    generated_at: "2026-05-13T10:00:00Z",
    entries: [
      {
        id: 1,
        track: {
          id: 11,
          title: "Remember",
        },
      },
    ],
  });

  assert.equal(status.hasActiveSubscription, true);
  assert.equal(status.account?.displayName, "Listener");
  assert.equal(landing.blockCount, 1);
  assert.equal(landing.findBlock("playlists")?.title, "New playlists");
  assert.equal(station.stationId, "user:nevermore");
  assert.equal(station.getIconUrl("90x90"), "https://avatars.yandex.net/get-music-content/station/90x90");
  assert.equal(history.lastTrack?.title, "Remember");
});
