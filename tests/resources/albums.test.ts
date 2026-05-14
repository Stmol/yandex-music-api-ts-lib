import assert from "node:assert/strict";
import test from "node:test";

import type { HttpRequest, HttpResponse, HttpTransport } from "../../src/http/types.ts";
import { Album } from "../../src/models/album/Album.ts";
import { AlbumSimilarEntities } from "../../src/models/album/AlbumSimilarEntities.ts";
import { AlbumTrailer } from "../../src/models/album/AlbumTrailer.ts";
import { Track } from "../../src/models/track/Track.ts";
import { AlbumsResource } from "../../src/resources/albums.ts";

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

test("albums resource builds paths and parses read-only album models", async () => {
  const transport = new QueueTransport([
    {
      body: {
        result: [{ id: 31, title: "Album" }],
      },
      headers: {},
      status: 200,
      statusText: "OK",
      url: "https://api.music.yandex.net/albums",
    },
    {
      body: {
        result: {
          id: 31,
          title: "Album",
          volumes: [[{ id: 11, title: "Song" }]],
        },
      },
      headers: {},
      status: 200,
      statusText: "OK",
      url: "https://api.music.yandex.net/albums/31/with-tracks",
    },
    {
      body: {
        result: {
          albums: [{ id: 32, title: "Similar Album" }],
          tracks: [{ id: 11, title: "Song" }],
        },
      },
      headers: {},
      status: 200,
      statusText: "OK",
      url: "https://api.music.yandex.net/albums/31/similar-entities",
    },
    {
      body: {
        result: {
          trailer_info: {
            available: true,
          },
        },
      },
      headers: {},
      status: 200,
      statusText: "OK",
      url: "https://api.music.yandex.net/albums/31/trailer",
    },
  ]);
  const resource = new AlbumsResource(transport);

  const albums = await resource.byIds([31, 32], { language: "en" });
  const albumWithTracks = await resource.withTracks(31, { language: "en" });
  const similar = await resource.similarEntities(31, { language: "en" });
  const trailer = await resource.trailer(31, { language: "en" });

  assert.deepEqual(transport.capturedRequests.map((request) => request.path), [
    "/albums",
    "/albums/31/with-tracks",
    "/albums/31/similar-entities",
    "/albums/31/trailer",
  ]);
  assert.deepEqual(transport.capturedRequests[0]?.query, {
    "album-ids": "31,32",
    lang: "en",
  });
  assert.ok(albums[0] instanceof Album);
  assert.ok(albumWithTracks instanceof Album);
  assert.ok(albumWithTracks.volumes?.[0]?.[0] instanceof Track);
  assert.ok(similar instanceof AlbumSimilarEntities);
  assert.ok(similar.albums?.[0] instanceof Album);
  assert.ok(trailer instanceof AlbumTrailer);
});
