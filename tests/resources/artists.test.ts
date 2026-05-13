import assert from "node:assert/strict";
import test from "node:test";

import type { HttpRequest, HttpResponse, HttpTransport } from "../../src/http/types.ts";
import { Artist } from "../../src/models/artist/Artist.ts";
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
