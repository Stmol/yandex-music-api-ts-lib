import assert from "node:assert/strict";
import test from "node:test";

import type { HttpRequest, HttpResponse, HttpTransport } from "../../src/http/types.ts";
import { Landing } from "../../src/models/landing/Landing.ts";
import { LandingResource } from "../../src/resources/landing.ts";

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

test("landing.landing serializes block lists and parses Landing blocks", async () => {
  const transport = new MockTransport({
    body: {
      result: {
        blocks: [
          {
            id: "new-playlists",
            type: "playlists",
            title: "New playlists",
          },
        ],
      },
    },
    headers: {},
    status: 200,
    statusText: "OK",
    url: "https://api.music.yandex.net/landing3",
  });

  const resource = new LandingResource(transport);
  const landing = await resource.landing(["personal-playlists", "mixes"], {
    language: "ru",
  });

  assert.equal(transport.capturedRequest?.path, "/landing3");
  assert.deepEqual(transport.capturedRequest?.query, {
    blocks: "personal-playlists,mixes",
    lang: "ru",
  });
  assert.ok(landing instanceof Landing);
  assert.equal(landing.blockCount, 1);
  assert.equal(landing.findBlock("playlists")?.title, "New playlists");
});
