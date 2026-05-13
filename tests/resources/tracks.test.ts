import assert from "node:assert/strict";
import test from "node:test";

import type { HttpRequest, HttpResponse, HttpTransport } from "../../src/http/types.ts";
import { Track } from "../../src/models/track/Track.ts";
import { TracksResource } from "../../src/resources/tracks.ts";

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

test("tracks.byIds serializes ids into the proven query format and parses Track models", async () => {
  const transport = new MockTransport({
    body: {
      result: [
        {
          id: 11,
          title: "Wake Up",
          version: "Live",
          artists: [{ id: 7, name: "The Band" }],
        },
      ],
    },
    headers: {},
    status: 200,
    statusText: "OK",
    url: "https://api.music.yandex.net/tracks",
  });

  const resource = new TracksResource(transport);
  const tracks = await resource.byIds(["11:22", "33:44"], {
    language: "ru",
    withPositions: true,
  });

  assert.equal(transport.capturedRequest?.path, "/tracks");
  assert.deepEqual(transport.capturedRequest?.query, {
    lang: "ru",
    "track-ids": "11:22,33:44",
    "with-positions": true,
  });
  assert.ok(tracks[0] instanceof Track);
  assert.equal(tracks[0]?.displayTitle, "Wake Up (Live)");
  assert.deepEqual(tracks[0]?.artistsNames, ["The Band"]);
});

test("tracks.downloadInfo serializes options and normalizes plain download payloads", async () => {
  const transport = new MockTransport({
    body: {
      result: [
        {
          codec: "mp3",
          bitrate_in_kbps: 320,
          direct: "https://music.yandex.ru/file.mp3",
          download_info_url: "https://storage.yandex.net/info",
          preview: false,
        },
      ],
    },
    headers: {},
    status: 200,
    statusText: "OK",
    url: "https://api.music.yandex.net/tracks/11/download-info",
  });

  const resource = new TracksResource(transport);
  const entries = await resource.downloadInfo("11:22", {
    getDirectLinks: true,
    preview: false,
  });

  assert.equal(transport.capturedRequest?.path, "/tracks/11%3A22/download-info");
  assert.deepEqual(transport.capturedRequest?.query, {
    lang: undefined,
    "get-direct-links": true,
    preview: false,
  });
  assert.deepEqual(entries, [
    {
      bitrateInKbps: 320,
      codec: "mp3",
      direct: "https://music.yandex.ru/file.mp3",
      downloadInfoUrl: "https://storage.yandex.net/info",
      preview: false,
    },
  ]);
});
