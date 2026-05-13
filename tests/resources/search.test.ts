import assert from "node:assert/strict";
import test from "node:test";

import type { HttpRequest, HttpResponse, HttpTransport } from "../../src/http/types.ts";
import { Search } from "../../src/models/search/Search.ts";
import { Track } from "../../src/models/track/Track.ts";
import { SearchResource } from "../../src/resources/search.ts";

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

test("search.search serializes query parameters and parses the Search model", async () => {
  const transport = new MockTransport({
    body: {
      result: {
        text: "Muse",
        best: {
          type: "track",
          result: {
            id: 11,
            title: "Uprising",
          },
        },
        tracks: {
          items: [
            {
              id: 11,
              title: "Uprising",
            },
          ],
          total: 1,
        },
      },
    },
    headers: {},
    status: 200,
    statusText: "OK",
    url: "https://api.music.yandex.net/search",
  });

  const resource = new SearchResource(transport);
  const result = await resource.search("Muse", {
    language: "en",
    nocorrect: true,
    page: 2,
    pageSize: 10,
    playlistInBest: false,
    type: "track",
  });

  assert.equal(transport.capturedRequest?.path, "/search");
  assert.deepEqual(transport.capturedRequest?.query, {
    lang: "en",
    nocorrect: true,
    page: 2,
    "page-size": 10,
    "playlist-in-best": false,
    text: "Muse",
    type: "track",
  });
  assert.ok(result instanceof Search);
  assert.ok(result.best?.result instanceof Track);
  assert.equal(result.hasResults, true);
});
