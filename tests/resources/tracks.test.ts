import assert from "node:assert/strict";
import test from "node:test";

import { ApiSchemaError } from "../../src/core/errors.ts";
import type { HttpRequest, HttpResponse, HttpTransport } from "../../src/http/types.ts";
import { DownloadInfo } from "../../src/models/shared/DownloadInfo.ts";
import { SimilarTracks } from "../../src/models/track/SimilarTracks.ts";
import { Supplement } from "../../src/models/track/Supplement.ts";
import { Track } from "../../src/models/track/Track.ts";
import { TrackFullInfo } from "../../src/models/track/TrackFullInfo.ts";
import { TrackLyrics } from "../../src/models/track/TrackLyrics.ts";
import { TrackTrailer } from "../../src/models/track/TrackTrailer.ts";
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
  assert.ok(entries[0] instanceof DownloadInfo);
  assert.equal(entries[0]?.bitrateInKbps, 320);
  assert.equal(entries[0]?.codec, "mp3");
  assert.equal(entries[0]?.direct, "https://music.yandex.ru/file.mp3");
  assert.equal(entries[0]?.downloadInfoUrl, "https://storage.yandex.net/info");
  assert.equal(entries[0]?.preview, false);
  assert.equal(entries[0]?.matches("mp3", 320), true);
});

test("tracks expanded read-only endpoints build paths and parse model results", async () => {
  const transport = new QueueTransport([
    {
      body: {
        result: {
          lyrics: {
            full_lyrics: "line one",
          },
          videos: [{ title: "Clip" }],
        },
      },
      headers: {},
      status: 200,
      statusText: "OK",
      url: "https://api.music.yandex.net/tracks/11/supplement",
    },
    {
      body: {
        result: {
          lyrics: "line one",
          text_language: "en",
        },
      },
      headers: {},
      status: 200,
      statusText: "OK",
      url: "https://api.music.yandex.net/tracks/11/lyrics",
    },
    {
      body: {
        result: {
          tracks: [{ id: 21, title: "Close" }],
        },
      },
      headers: {},
      status: 200,
      statusText: "OK",
      url: "https://api.music.yandex.net/tracks/11/similar",
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
      url: "https://api.music.yandex.net/tracks/11/trailer",
    },
    {
      body: {
        result: {
          track: { id: 11, title: "Song" },
          supplement: { lyrics: { lyrics: "short" } },
          similar_tracks: { tracks: [{ id: 21, title: "Close" }] },
        },
      },
      headers: {},
      status: 200,
      statusText: "OK",
      url: "https://api.music.yandex.net/tracks/11/full-info",
    },
  ]);
  const resource = new TracksResource(transport);

  const supplement = await resource.supplement("11:22", { language: "en" });
  const lyrics = await resource.lyrics("11:22", {
    format: "LRC",
    language: "en",
    sign: "signature",
    timestamp: 123,
  });
  const similar = await resource.similar("11:22", { language: "en" });
  const trailer = await resource.trailer("11:22", { language: "en" });
  const fullInfo = await resource.fullInfo("11:22", { language: "en" });

  assert.deepEqual(transport.capturedRequests.map((request) => request.path), [
    "/tracks/11%3A22/supplement",
    "/tracks/11%3A22/lyrics",
    "/tracks/11%3A22/similar",
    "/tracks/11%3A22/trailer",
    "/tracks/11%3A22/full-info",
  ]);
  assert.deepEqual(transport.capturedRequests[1]?.query, {
    format: "LRC",
    lang: "en",
    sign: "signature",
    timeStamp: 123,
  });
  assert.ok(supplement instanceof Supplement);
  assert.ok(lyrics instanceof TrackLyrics);
  assert.ok(similar instanceof SimilarTracks);
  assert.ok(trailer instanceof TrackTrailer);
  assert.ok(fullInfo instanceof TrackFullInfo);
  assert.ok(fullInfo.track instanceof Track);
});

test("tracks.byIds rejects malformed result payloads", async () => {
  const transport = new MockTransport({
    body: {
      result: {
        id: 11,
      },
    },
    headers: {},
    status: 200,
    statusText: "OK",
    url: "https://api.music.yandex.net/tracks",
  });

  const resource = new TracksResource(transport);

  await assert.rejects(
    () => resource.byIds([11]),
    (error: unknown) => {
      assert.ok(error instanceof ApiSchemaError);
      assert.equal(error.path, "$.result");
      assert.equal(error.expected, "array");
      return true;
    },
  );
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
