import assert from "node:assert/strict";
import test from "node:test";

import type { HttpRequest, HttpResponse, HttpTransport } from "../../src/http/types.ts";
import { Playlist } from "../../src/models/playlist/Playlist.ts";
import { PlaylistsResource } from "../../src/resources/playlists.ts";

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

test("playlists.list uses the user playlist list endpoint and parses Playlist models", async () => {
  const transport = new MockTransport({
    body: {
      result: [
        {
          kind: 100,
          title: "Morning",
          owner: {
            uid: 501,
          },
        },
      ],
    },
    headers: {},
    status: 200,
    statusText: "OK",
    url: "https://api.music.yandex.net/users/501/playlists/list",
  });

  const resource = new PlaylistsResource(transport);
  const playlists = await resource.list(501, { language: "en" });

  assert.equal(transport.capturedRequest?.path, "/users/501/playlists/list");
  assert.deepEqual(transport.capturedRequest?.query, {
    lang: "en",
  });
  assert.ok(playlists[0] instanceof Playlist);
  assert.equal(playlists[0]?.title, "Morning");
});

test("playlists.get builds the single playlist path and keeps nested handwritten parsing", async () => {
  const transport = new MockTransport({
    body: {
      result: {
        kind: 100,
        title: "Morning",
        owner: {
          uid: 700,
        },
        tracks: [
          {
            id: 1,
            title: "Wake Up",
          },
        ],
      },
    },
    headers: {},
    status: 200,
    statusText: "OK",
    url: "https://api.music.yandex.net/users/501/playlists/100",
  });

  const resource = new PlaylistsResource(transport);
  const playlist = await resource.get(501, 100, { richTracks: true });

  assert.equal(transport.capturedRequest?.path, "/users/501/playlists/100");
  assert.deepEqual(transport.capturedRequest?.query, {
    lang: undefined,
    "rich-tracks": true,
  });
  assert.ok(playlist instanceof Playlist);
  assert.equal(playlist.ownerUid, 700);
  assert.equal(playlist.tracks?.[0]?.title, "Wake Up");
});
