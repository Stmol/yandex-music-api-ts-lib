import assert from "node:assert/strict";
import test from "node:test";

import {
  Album,
  AlbumSimilarEntities,
  AlbumTrailer,
  Artist,
  ArtistAlbums,
  ArtistSimilar,
  ArtistTracks,
  BriefInfo,
  ChartInfo,
  DownloadInfo,
  Feed,
  Genre,
  LandingList,
  LyricsInfo,
  Major,
  MusicHistoryItems,
  R128,
  SimilarTracks,
  Station,
  StationResult,
  StationTracksResult,
  Supplement,
  Suggestions,
  TagResult,
  Track,
  TrackFullInfo,
  TrackLyrics,
  TrailerInfo,
  Video,
} from "../../src/models/index.ts";

test("DownloadInfo matches by codec and bitrate after camelCase normalization", () => {
  const info = DownloadInfo.fromJSON({
    codec: "mp3",
    bitrate_in_kbps: 320,
    download_info_url: "https://storage.test/info",
    file_size: 12345,
  });

  assert.ok(info instanceof DownloadInfo);
  assert.equal(info.bitrateInKbps, 320);
  assert.equal(info.downloadInfoUrl, "https://storage.test/info");
  assert.equal(info.fileSize, 12345);
  assert.equal(info.matches("mp3", 320), true);
  assert.equal(info.matches("aac", 320), false);
});

test("Track parses expanded read-only nested metadata models", () => {
  const track = Track.fromJSON({
    id: 11,
    title: "Song",
    preview_duration_ms: 45000,
    major: { id: 1, name: "Major Label" },
    lyrics_info: {
      has_available_sync_lyrics: true,
      has_available_text_lyrics: false,
    },
    r128: { i: -10, tp: -1 },
    normalization: { gain: -3, peak: 0.9 },
    meta_data: {
      album: "Album Name",
      track_number: 7,
      release_date: "2026-05-13",
    },
    substituted: { id: 12, title: "Substitute" },
    matched_track: { id: 13, title: "Matched" },
  });

  assert.ok(track.major instanceof Major);
  assert.ok(track.lyricsInfo instanceof LyricsInfo);
  assert.ok(track.r128 instanceof R128);
  assert.ok(track.substituted instanceof Track);
  assert.ok(track.matchedTrack instanceof Track);
  assert.equal(track.previewDurationMs, 45000);
  assert.equal(track.lyricsInfo?.hasAvailableSyncLyrics, true);
  assert.equal((track.metaData as { readonly trackNumber?: number } | null | undefined)?.trackNumber, 7);
  assert.equal((track.metaData as { readonly releaseDate?: string } | null | undefined)?.releaseDate, "2026-05-13");
});

test("Track supplement, similar, trailer, and full info parse nested models", () => {
  const supplement = Supplement.fromJSON({
    id: "11",
    lyrics: {
      full_lyrics: "line one",
      text_language: "en",
      has_rights: true,
    },
    videos: [
      {
        title: "Clip",
        embed_url: "https://video.test/embed",
        cover: { uri: "avatars.yandex.net/get-music-content/video/%%" },
      },
    ],
  });
  const similar = SimilarTracks.fromJSON({
    similar_tracks: [{ id: 21, title: "Close" }],
    tracks: [{ id: 22, title: "Also close" }],
  });
  const fullInfo = TrackFullInfo.fromJSON({
    track: { id: 11, title: "Song" },
    albums: [{ id: 31, title: "Album" }],
    supplement: {
      lyrics: { lyrics: "short" },
    },
    similar_tracks: {
      tracks: [{ id: 21, title: "Close" }],
    },
  });

  assert.ok(supplement.lyrics instanceof TrackLyrics);
  assert.ok(supplement.videos?.[0] instanceof Video);
  assert.equal(supplement.lyrics?.fullLyrics, "line one");
  assert.equal(supplement.videos?.[0]?.embedUrl, "https://video.test/embed");
  assert.ok(similar.similarTracks?.[0] instanceof Track);
  assert.ok(fullInfo.track instanceof Track);
  assert.ok(fullInfo.albums?.[0] instanceof Album);
  assert.ok(fullInfo.supplement instanceof Supplement);
  assert.ok(fullInfo.similarTracks instanceof SimilarTracks);
});

test("Album parses volumes, trailer, and similar entity models", () => {
  const album = Album.fromJSON({
    id: 31,
    title: "Album",
    track_count: 2,
    volumes: [
      [
        {
          id: 1,
          title: "Intro",
          major: { name: "Major Label" },
        },
      ],
    ],
  });
  const trailer = AlbumTrailer.fromJSON({
    trailer_info: {
      available: true,
      duration_ms: 30000,
    },
  });
  const similar = AlbumSimilarEntities.fromJSON({
    albums: [{ id: 32, title: "Next Album" }],
    artists: [{ id: 41, name: "Artist" }],
    tracks: [{ id: 51, title: "Track" }],
  });

  assert.ok(album.volumes?.[0]?.[0] instanceof Track);
  assert.ok(album.volumes?.[0]?.[0]?.major instanceof Major);
  assert.equal(album.trackCount, 2);
  assert.ok(trailer.trailerInfo instanceof TrailerInfo);
  assert.equal(trailer.trailerInfo?.durationMs, 30000);
  assert.ok(similar.albums?.[0] instanceof Album);
  assert.ok(similar.artists?.[0] instanceof Artist);
  assert.ok(similar.tracks?.[0] instanceof Track);
});

test("Artist brief, tracks, albums, and similar parse nested models", () => {
  const brief = BriefInfo.fromJSON({
    artist: { id: 41, name: "Artist" },
    albums: [{ id: 31, title: "Album" }],
    also_albums: [{ id: 32, title: "Also Album" }],
    popular_tracks: [{ id: 51, title: "Hit" }],
  });
  const tracks = ArtistTracks.fromJSON({
    tracks: [{ id: 51, title: "Hit" }],
  });
  const albums = ArtistAlbums.fromJSON({
    albums: [{ id: 31, title: "Album" }],
  });
  const similar = ArtistSimilar.fromJSON({
    artists: [{ id: 42, name: "Similar Artist" }],
  });

  assert.ok(brief.artist instanceof Artist);
  assert.ok(brief.albums?.[0] instanceof Album);
  assert.ok(brief.alsoAlbums?.[0] instanceof Album);
  assert.ok(brief.popularTracks?.[0] instanceof Track);
  assert.ok(tracks.tracks?.[0] instanceof Track);
  assert.ok(albums.albums?.[0] instanceof Album);
  assert.ok(similar.artists?.[0] instanceof Artist);
});

test("Search suggestions parse best result and string suggestions", () => {
  const suggestions = Suggestions.fromJSON({
    best: {
      type: "track",
      result: {
        id: 51,
        title: "Track",
      },
    },
    suggestions: ["track", "track remix"],
  });

  assert.ok(suggestions instanceof Suggestions);
  assert.ok(suggestions.best?.result instanceof Track);
  assert.deepEqual(suggestions.suggestions, ["track", "track remix"]);
});

test("MusicHistoryItems parses nested item ids and full models", () => {
  const historyItems = MusicHistoryItems.fromJSON({
    items: [
      {
        type: "track",
        data: {
          item_id: {
            album_id: "31",
            track_id: "51",
          },
          full_model: {
            id: 51,
            title: "Track",
          },
        },
      },
    ],
  });

  assert.ok(historyItems instanceof MusicHistoryItems);
  assert.equal(historyItems.items?.[0]?.data?.itemId?.trackId, "51");
  assert.ok(historyItems.items?.[0]?.data?.fullModel instanceof Track);
});

test("Landing, genre, feed, and radio read-only models normalize nested payloads", () => {
  const list = LandingList.fromJSON({
    title: "New",
    albums: [{ id: 31, title: "Album" }],
    tracks: [{ id: 51, title: "Track" }],
    artists: [{ id: 41, name: "Artist" }],
  });
  const tag = TagResult.fromJSON({
    tag: "summer",
    playlists: [{ kind: 1, title: "Playlist" }],
  });
  const chart = ChartInfo.fromJSON({
    position: 1,
    progress: "up",
    listeners: 1000,
  });
  const genre = Genre.fromJSON({
    id: "rock",
    composer_top: true,
    title: {
      full_title: "Rock Music",
    },
    images: {
      background_color: "#000000",
    },
  });
  const feed = Feed.fromJSON({
    generated_playlists: [{ kind: 1, title: "Daily" }],
    days: [
      {
        day: "2026-05-13",
        events: [{ type: "track-finished", title: "Played" }],
      },
    ],
  });
  const stationResult = StationResult.fromJSON({
    station: {
      id: { type: "genre", tag: "rock" },
      icon: { uri: "avatars.yandex.net/get-music-content/radio/%%" },
    },
  });
  const tracksResult = StationTracksResult.fromJSON({
    tracks: [{ id: 51, title: "Track" }],
  });

  assert.ok(list.albums?.[0] instanceof Album);
  assert.ok(list.tracks?.[0] instanceof Track);
  assert.ok(list.artists?.[0] instanceof Artist);
  assert.equal(tag.playlists?.[0]?.title, "Playlist");
  assert.equal(chart.listeners, 1000);
  assert.ok(genre instanceof Genre);
  assert.equal(genre.composerTop, true);
  assert.equal(typeof genre.title === "object" ? genre.title?.fullTitle : null, "Rock Music");
  assert.equal(feed.generatedPlaylists?.[0]?.title, "Daily");
  assert.equal(feed.days?.[0]?.events?.[0]?.type, "track-finished");
  assert.ok(stationResult.station instanceof Station);
  assert.equal(stationResult.station?.stationId, "genre:rock");
  assert.ok(tracksResult.tracks?.[0] instanceof Track);
});
