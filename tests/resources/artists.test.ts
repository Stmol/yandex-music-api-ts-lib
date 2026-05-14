import assert from "node:assert/strict";
import test from "node:test";

import type { HttpRequest, HttpResponse, HttpTransport } from "../../src/http/types.ts";
import { Artist } from "../../src/models/artist/Artist.ts";
import { ArtistAlbums } from "../../src/models/artist/ArtistAlbums.ts";
import { ArtistInfo } from "../../src/models/artist/ArtistInfo.ts";
import { ArtistLinks } from "../../src/models/artist/ArtistLinks.ts";
import { ArtistSimilar } from "../../src/models/artist/ArtistSimilar.ts";
import { ArtistTracks } from "../../src/models/artist/ArtistTracks.ts";
import { BriefInfo } from "../../src/models/artist/BriefInfo.ts";
import { Album } from "../../src/models/album/Album.ts";
import { Track } from "../../src/models/track/Track.ts";
import { ArtistsResource } from "../../src/resources/artists.ts";

class MockTransport implements HttpTransport {
  capturedRequest: HttpRequest | undefined;
  private readonly response: HttpResponse;

  constructor(response: HttpResponse) {
    this.response = response;
  }

  async request(request: HttpRequest): Promise<HttpResponse> {
    this.capturedRequest = request;

    return this.response;
  }
}

test("artists.byIds uses the ids endpoint and parses Artist models", async () => {
  const transport = new MockTransport({
    body: {
      result: [
        {
          id: 501,
          name: "Muse",
          counts: {
            tracks: 100,
          },
        },
      ],
    },
    headers: {},
    status: 200,
    statusText: "OK",
    url: "https://api.music.yandex.net/artists",
  });

  const resource = new ArtistsResource(transport);
  const artists = await resource.byIds([501, 502], { language: "en" });

  assert.equal(transport.capturedRequest?.path, "/artists");
  assert.deepEqual(transport.capturedRequest?.query, {
    "artist-ids": "501,502",
    lang: "en",
  });
  assert.ok(artists[0] instanceof Artist);
  assert.equal(artists[0]?.displayName, "Muse");
  assert.equal(artists[0]?.counts?.tracks, 100);
});

test("artists expanded read-only endpoints build paths and parse model results", async () => {
  const transport = new QueueTransport([
    {
      body: {
        result: {
          artist: { id: 501, name: "Muse" },
          albums: [{ id: 31, title: "Album" }],
          popular_tracks: [{ id: 11, title: "Hit" }],
        },
      },
      headers: {},
      status: 200,
      statusText: "OK",
      url: "https://api.music.yandex.net/artists/501/brief-info",
    },
    {
      body: {
        result: {
          tracks: [{ id: 11, title: "Hit" }],
        },
      },
      headers: {},
      status: 200,
      statusText: "OK",
      url: "https://api.music.yandex.net/artists/501/tracks",
    },
    {
      body: {
        result: {
          albums: [{ id: 31, title: "Album" }],
        },
      },
      headers: {},
      status: 200,
      statusText: "OK",
      url: "https://api.music.yandex.net/artists/501/albums",
    },
    {
      body: {
        result: {
          artists: [{ id: 502, name: "Similar" }],
        },
      },
      headers: {},
      status: 200,
      statusText: "OK",
      url: "https://api.music.yandex.net/artists/501/similar",
    },
    {
      body: {
        result: {
          albums: [{ id: 32, title: "Direct Album" }],
        },
      },
      headers: {},
      status: 200,
      statusText: "OK",
      url: "https://api.music.yandex.net/artists/501/direct-albums",
    },
    {
      body: {
        result: {
          albums: [{ id: 33, title: "Also Album" }],
        },
      },
      headers: {},
      status: 200,
      statusText: "OK",
      url: "https://api.music.yandex.net/artists/501/also-albums",
    },
    {
      body: {
        result: {
          albums: [{ id: 34, title: "Discography Album" }],
        },
      },
      headers: {},
      status: 200,
      statusText: "OK",
      url: "https://api.music.yandex.net/artists/501/discography-albums",
    },
    {
      body: {
        result: {
          albums: [{ id: 35, title: "Safe Direct Album" }],
        },
      },
      headers: {},
      status: 200,
      statusText: "OK",
      url: "https://api.music.yandex.net/artists/501/safe-direct-albums",
    },
    {
      body: {
        result: ["11", 12],
      },
      headers: {},
      status: 200,
      statusText: "OK",
      url: "https://api.music.yandex.net/artists/501/track-ids",
    },
    {
      body: {
        result: {
          links: [{ title: "Website", href: "https://artist.test" }],
        },
      },
      headers: {},
      status: 200,
      statusText: "OK",
      url: "https://api.music.yandex.net/artists/501/artist-links",
    },
    {
      body: {
        result: {
          artist: { id: 501, name: "Muse" },
          albums: [{ id: 31, title: "Album" }],
          tracks: [{ id: 11, title: "Hit" }],
        },
      },
      headers: {},
      status: 200,
      statusText: "OK",
      url: "https://api.music.yandex.net/artists/501/info",
    },
  ]);
  const resource = new ArtistsResource(transport);

  const brief = await resource.briefInfo(501, { language: "en" });
  const tracks = await resource.tracks(501, {
    language: "en",
    page: 2,
    pageSize: 20,
  });
  const albums = await resource.albums(501, {
    language: "en",
    page: 3,
    pageSize: 30,
  });
  const similar = await resource.similar(501, { language: "en" });
  const directAlbums = await resource.directAlbums(501, {
    language: "en",
    page: 1,
    pageSize: 10,
    sortBy: "year",
  });
  const alsoAlbums = await resource.alsoAlbums(501, {
    language: "en",
    page: 2,
    pageSize: 10,
    sortBy: "rating",
  });
  const discographyAlbums = await resource.discographyAlbums(501, {
    language: "en",
    page: 3,
    pageSize: 10,
    sortBy: "year",
  });
  const safeDirectAlbums = await resource.safeDirectAlbums(501, {
    language: "en",
    limit: 15,
    sortBy: "year",
    sortOrder: "desc",
  });
  const trackIds = await resource.trackIds(501, {
    language: "en",
    page: 4,
    pageSize: 50,
  });
  const links = await resource.links(501, { language: "en" });
  const info = await resource.info(501, { language: "en" });

  assert.deepEqual(transport.capturedRequests.map((request) => request.path), [
    "/artists/501/brief-info",
    "/artists/501/tracks",
    "/artists/501/albums",
    "/artists/501/similar",
    "/artists/501/direct-albums",
    "/artists/501/also-albums",
    "/artists/501/discography-albums",
    "/artists/501/safe-direct-albums",
    "/artists/501/track-ids",
    "/artists/501/artist-links",
    "/artists/501/info",
  ]);
  assert.deepEqual(transport.capturedRequests[1]?.query, {
    lang: "en",
    page: 2,
    "page-size": 20,
  });
  assert.deepEqual(transport.capturedRequests[2]?.query, {
    lang: "en",
    page: 3,
    "page-size": 30,
  });
  assert.deepEqual(transport.capturedRequests[4]?.query, {
    lang: "en",
    page: 1,
    "page-size": 10,
    "sort-by": "year",
  });
  assert.deepEqual(transport.capturedRequests[7]?.query, {
    lang: "en",
    limit: 15,
    "sort-by": "year",
    "sort-order": "desc",
  });
  assert.deepEqual(transport.capturedRequests[8]?.query, {
    lang: "en",
    page: 4,
    "page-size": 50,
  });
  assert.ok(brief instanceof BriefInfo);
  assert.ok(brief.artist instanceof Artist);
  assert.ok(brief.albums?.[0] instanceof Album);
  assert.ok(brief.popularTracks?.[0] instanceof Track);
  assert.ok(tracks instanceof ArtistTracks);
  assert.ok(tracks.tracks?.[0] instanceof Track);
  assert.ok(albums instanceof ArtistAlbums);
  assert.ok(albums.albums?.[0] instanceof Album);
  assert.ok(similar instanceof ArtistSimilar);
  assert.ok(similar.artists?.[0] instanceof Artist);
  assert.ok(directAlbums instanceof ArtistAlbums);
  assert.ok(alsoAlbums instanceof ArtistAlbums);
  assert.ok(discographyAlbums instanceof ArtistAlbums);
  assert.ok(safeDirectAlbums instanceof ArtistAlbums);
  assert.deepEqual(trackIds, ["11", "12"]);
  assert.ok(links instanceof ArtistLinks);
  assert.ok(info instanceof ArtistInfo);
  assert.ok(info.artist instanceof Artist);
});

class QueueTransport implements HttpTransport {
  readonly capturedRequests: HttpRequest[] = [];
  private responseIndex = 0;

  constructor(private readonly responses: readonly HttpResponse[]) {}

  async request(request: HttpRequest): Promise<HttpResponse> {
    this.capturedRequests.push(request);
    const response = this.responses[this.responseIndex];
    this.responseIndex += 1;

    assert.ok(response);
    return response;
  }
}
