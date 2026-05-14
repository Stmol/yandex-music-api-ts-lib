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
  Playlist,
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
import { Product } from "../../src/models/account/Product.ts";
import { ArtistClipItem } from "../../src/models/artist/ArtistClipItem.ts";
import { ArtistClips } from "../../src/models/artist/ArtistClips.ts";
import { ArtistDonationItem } from "../../src/models/artist/ArtistDonationItem.ts";
import { ArtistDonations } from "../../src/models/artist/ArtistDonations.ts";
import { Clip } from "../../src/models/clip/Clip.ts";
import { ClipsWillLike } from "../../src/models/clip/ClipsWillLike.ts";
import { ArtistConcerts } from "../../src/models/concert/ArtistConcerts.ts";
import { Concert } from "../../src/models/concert/Concert.ts";
import { ConcertFeed } from "../../src/models/concert/ConcertFeed.ts";
import { ConcertFeedItem } from "../../src/models/concert/ConcertFeedItem.ts";
import { ConcertLocation } from "../../src/models/concert/ConcertLocation.ts";
import { ConcertLocations } from "../../src/models/concert/ConcertLocations.ts";
import { Day } from "../../src/models/feed/Day.ts";
import { Event } from "../../src/models/feed/Event.ts";
import { GeneratedPlaylist } from "../../src/models/feed/GeneratedPlaylist.ts";
import { TrackWithAds } from "../../src/models/feed/TrackWithAds.ts";
import { MusicHistoryItem } from "../../src/models/history/MusicHistoryItem.ts";
import { LabelAlbums } from "../../src/models/label/LabelAlbums.ts";
import { LabelArtists } from "../../src/models/label/LabelArtists.ts";
import { Block } from "../../src/models/landing/Block.ts";
import { BlockEntity } from "../../src/models/landing/BlockEntity.ts";
import { Chart } from "../../src/models/landing/Chart.ts";
import { ChartItem } from "../../src/models/landing/ChartItem.ts";
import { MetatagAlbums } from "../../src/models/metatag/MetatagAlbums.ts";
import { MetatagArtistEntry } from "../../src/models/metatag/MetatagArtistEntry.ts";
import { MetatagArtists } from "../../src/models/metatag/MetatagArtists.ts";
import { MetatagPlaylists } from "../../src/models/metatag/MetatagPlaylists.ts";
import { MetatagTitle } from "../../src/models/metatag/MetatagTitle.ts";
import { MetatagTree } from "../../src/models/metatag/MetatagTree.ts";
import { PlaylistId } from "../../src/models/playlist/PlaylistId.ts";
import { PlaylistSimilarEntities } from "../../src/models/playlist/PlaylistSimilarEntities.ts";
import { PlaylistTrailer } from "../../src/models/playlist/PlaylistTrailer.ts";
import { Sequence } from "../../src/models/radio/Sequence.ts";
import { Shot } from "../../src/models/shot/Shot.ts";
import { ShotEvent } from "../../src/models/shot/ShotEvent.ts";
import { SkeletonBlock } from "../../src/models/skeleton/SkeletonBlock.ts";
import { SkeletonTab } from "../../src/models/skeleton/SkeletonTab.ts";
import { SimilarEntityItem } from "../../src/models/wave/SimilarEntityItem.ts";
import { Wave } from "../../src/models/wave/Wave.ts";

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

test("Account and playlist metadata models normalize nested payloads", () => {
  const product = Product.fromJSON({
    product_id: "plus",
    trial_duration: 30,
    price: { amount: 199, currency: "RUB" },
  });
  const playlistId = PlaylistId.fromJSON({ uid: 100, kind: 1 });
  const trailer = PlaylistTrailer.fromJSON({
    trailer_info: {
      available: true,
    },
  });
  const similar = PlaylistSimilarEntities.fromJSON({
    playlists: [{ kind: 1, title: "Playlist" }],
    albums: [{ id: 31, title: "Album" }],
    artists: [{ id: 41, name: "Artist" }],
    tracks: [{ id: 51, title: "Track" }],
  });

  assert.equal(product.productId, "plus");
  assert.equal(product.trialDuration, 30);
  assert.equal(playlistId.uid, 100);
  assert.ok(trailer.trailerInfo instanceof TrailerInfo);
  assert.equal(trailer.trailerInfo?.available, true);
  assert.ok(similar.playlists?.[0] instanceof Playlist);
  assert.ok(similar.albums?.[0] instanceof Album);
  assert.ok(similar.artists?.[0] instanceof Artist);
  assert.ok(similar.tracks?.[0] instanceof Track);
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

test("New read-only model families parse nested arrays", () => {
  const clipsWillLike = ClipsWillLike.fromJSON({
    clips: [{ id: "clip-1", title: "Clip" }],
  });
  const artistConcerts = ArtistConcerts.fromJSON({
    concerts: [{ id: "c1", title: "Live" }],
  });
  const concertFeed = ConcertFeed.fromJSON({
    items: [{ data: { concert: { id: "c1", title: "Live" } } }],
  });
  const concertLocations = ConcertLocations.fromJSON({
    locations: [{ id: "loc1", title: "Venue" }],
  });
  const labelAlbums = LabelAlbums.fromJSON({
    albums: [{ id: 1, title: "Album" }],
  });
  const labelArtists = LabelArtists.fromJSON({
    artists: [{ id: 41, name: "Artist" }],
  });
  const metatagAlbums = MetatagAlbums.fromJSON({
    albums: [{ id: 2, title: "Tagged Album" }],
  });
  const metatagArtists = MetatagArtists.fromJSON({
    artists: [{ artist: { id: 42, name: "Tagged Artist" } }],
  });
  const metatagPlaylists = MetatagPlaylists.fromJSON({
    playlists: [{ kind: 1, title: "Tagged Playlist" }],
  });
  const metatagTree = MetatagTree.fromJSON({
    title: { title: "Mood" },
    children: [{ id: "rock", title: { title: "Rock" } }],
  });
  const shot = Shot.fromJSON({
    events: [{ type: "open", data: { id: "shot-data" } }],
  });
  const skeletonTab = SkeletonTab.fromJSON({
    blocks: [{ type: "album", data: { title: "Block" } }],
  });
  const wave = Wave.fromJSON({
    items: [{ type: "track", data: { track: { id: 51, title: "Track" } } }],
  });

  assert.ok(clipsWillLike.clips?.[0] instanceof Clip);
  assert.ok(artistConcerts.concerts?.[0] instanceof Concert);
  assert.ok(concertFeed.items?.[0] instanceof ConcertFeedItem);
  assert.ok(concertFeed.items?.[0]?.data?.concert instanceof Concert);
  assert.ok(concertLocations.locations?.[0] instanceof ConcertLocation);
  assert.ok(labelAlbums.albums?.[0] instanceof Album);
  assert.ok(labelArtists.artists?.[0] instanceof Artist);
  assert.ok(metatagAlbums.albums?.[0] instanceof Album);
  assert.ok(metatagArtists.artists?.[0] instanceof MetatagArtistEntry);
  assert.ok((metatagArtists.artists?.[0] as MetatagArtistEntry | undefined)?.artist instanceof Artist);
  assert.ok(metatagPlaylists.playlists?.[0] instanceof Playlist);
  assert.ok(metatagTree.title instanceof MetatagTitle);
  assert.ok(metatagTree.children?.[0] instanceof MetatagTree);
  assert.ok(shot.events?.[0] instanceof ShotEvent);
  assert.ok(skeletonTab.blocks?.[0] instanceof SkeletonBlock);
  assert.ok(wave.items?.[0] instanceof SimilarEntityItem);
  assert.ok(wave.items?.[0]?.data?.track instanceof Track);
});

test("Expanded existing nested families parse nested models", () => {
  const artistClips = ArtistClips.fromJSON({
    items: [{ data: { clip: { id: "clip-1" } } }],
  });
  const artistDonations = ArtistDonations.fromJSON({
    items: [{ data: { goal: { amount: 1000, currency: "RUB" } } }],
  });
  const block = Block.fromJSON({
    type: "new-releases",
    entities: [{ type: "album", data: { id: 1, title: "Album" } }],
  });
  const chart = Chart.fromJSON({
    items: [{ track: { id: 1, title: "Track" }, chart: { position: 1 } }],
  });
  const generatedPlaylist = GeneratedPlaylist.fromJSON({
    playlist: { kind: 1, title: "Daily" },
  });
  const day = Day.fromJSON({
    day: "2026-05-14",
    events: [{ type: "track", data: { track: { id: 1, title: "Track" } } }],
  });
  const trackWithAds = TrackWithAds.fromJSON({
    track: { id: 1, title: "Track" },
  });
  const musicHistoryItem = MusicHistoryItem.fromJSON({
    type: "track",
    data: {
      item_id: { track_id: "1" },
      full_model: { track: { id: 1, title: "Track" } },
    },
  });
  const sequence = Sequence.fromJSON({ type: "track", track: { id: 1, title: "Track" } });

  assert.ok(artistClips.items?.[0] instanceof ArtistClipItem);
  assert.ok(artistClips.items?.[0]?.data?.clip instanceof Clip);
  assert.ok(artistDonations.items?.[0] instanceof ArtistDonationItem);
  assert.equal(artistDonations.items?.[0]?.data?.goal?.amount, 1000);
  assert.ok(block.entities?.[0] instanceof BlockEntity);
  assert.ok(block.entities?.[0]?.data instanceof Album);
  assert.ok(chart.items?.[0] instanceof ChartItem);
  assert.ok(chart.items?.[0]?.track instanceof Track);
  assert.ok(generatedPlaylist.playlist instanceof Playlist);
  assert.ok(day.events?.[0] instanceof Event);
  assert.ok(day.events?.[0]?.data instanceof TrackWithAds);
  assert.ok(trackWithAds.track instanceof Track);
  assert.equal(musicHistoryItem.data?.itemId?.trackId, "1");
  assert.ok(musicHistoryItem.data?.fullModel?.track instanceof Track);
  assert.ok(sequence.track instanceof Track);
});
