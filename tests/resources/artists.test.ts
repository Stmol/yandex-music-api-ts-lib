import assert from "node:assert/strict";
import test from "node:test";

import type { HttpRequest, HttpResponse, HttpTransport } from "../../src/http/types.ts";
import { Artist } from "../../src/models/artist/Artist.ts";
import { ArtistAlbums } from "../../src/models/artist/ArtistAlbums.ts";
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

  assert.deepEqual(transport.capturedRequests.map((request) => request.path), [
    "/artists/501/brief-info",
    "/artists/501/tracks",
    "/artists/501/albums",
    "/artists/501/similar",
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
