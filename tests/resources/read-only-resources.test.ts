import assert from "node:assert/strict";
import test from "node:test";

import type { HttpRequest, HttpResponse, HttpTransport } from "../../src/http/types.ts";
import { Status } from "../../src/models/account/Status.ts";
import { Genre } from "../../src/models/genre/Genre.ts";
import { MusicHistory } from "../../src/models/history/MusicHistory.ts";
import { Dashboard } from "../../src/models/radio/Dashboard.ts";
import { Station } from "../../src/models/radio/Station.ts";
import { StationResult } from "../../src/models/radio/StationResult.ts";
import { StationTracksResult } from "../../src/models/radio/StationTracksResult.ts";
import { Track } from "../../src/models/track/Track.ts";
import { GenresResource } from "../../src/resources/genres.ts";
import { HistoryResource } from "../../src/resources/history.ts";
import { RadioResource } from "../../src/resources/radio.ts";

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

test("genres.list builds the genres endpoint and parses Genre models", async () => {
  const transport = new QueueTransport([
    {
      body: {
        result: [
          {
            id: "rock",
            composer_top: true,
            title: {
              full_title: "Rock Music",
            },
          },
        ],
      },
      headers: {},
      status: 200,
      statusText: "OK",
      url: "https://api.music.yandex.net/genres",
    },
  ]);
  const resource = new GenresResource(transport);
  const genres = await resource.list({ language: "en" });

  assert.equal(transport.capturedRequests[0]?.path, "/genres");
  assert.deepEqual(transport.capturedRequests[0]?.query, {
    lang: "en",
  });
  assert.ok(genres[0] instanceof Genre);
  assert.equal(genres[0]?.composerTop, true);
});

test("radio resource builds rotor paths and parses read-only radio models", async () => {
  const transport = new QueueTransport([
    {
      body: {
        result: {
          account: { uid: 501 },
          plus: { has_plus: true },
        },
      },
      headers: {},
      status: 200,
      statusText: "OK",
      url: "https://api.music.yandex.net/rotor/account/status",
    },
    {
      body: {
        result: {
          stations: [
            {
              id: { type: "genre", tag: "rock" },
              name: "Rock",
            },
          ],
        },
      },
      headers: {},
      status: 200,
      statusText: "OK",
      url: "https://api.music.yandex.net/rotor/stations/dashboard",
    },
    {
      body: {
        result: [
          {
            station: {
              id: { type: "genre", tag: "rock" },
              name: "Rock",
            },
          },
        ],
      },
      headers: {},
      status: 200,
      statusText: "OK",
      url: "https://api.music.yandex.net/rotor/stations/list",
    },
    {
      body: {
        result: [
          {
            station: {
              id: { type: "genre", tag: "rock" },
              name: "Rock",
            },
          },
        ],
      },
      headers: {},
      status: 200,
      statusText: "OK",
      url: "https://api.music.yandex.net/rotor/station/genre%3Arock/info",
    },
    {
      body: {
        result: {
          tracks: [{ id: 11, title: "Station Track" }],
        },
      },
      headers: {},
      status: 200,
      statusText: "OK",
      url: "https://api.music.yandex.net/rotor/station/genre%3Arock/tracks",
    },
  ]);
  const resource = new RadioResource(transport);

  const status = await resource.accountStatus({ language: "en" });
  const dashboard = await resource.stationsDashboard({ language: "en" });
  const list = await resource.stationsList({ language: "en" });
  const info = await resource.stationInfo("genre:rock", { language: "en" });
  const tracks = await resource.stationTracks("genre:rock", {
    language: "en",
    queue: "queue-id",
    settings2: true,
  });

  assert.deepEqual(transport.capturedRequests.map((request) => request.path), [
    "/rotor/account/status",
    "/rotor/stations/dashboard",
    "/rotor/stations/list",
    "/rotor/station/genre%3Arock/info",
    "/rotor/station/genre%3Arock/tracks",
  ]);
  assert.deepEqual(transport.capturedRequests[2]?.query, {
    language: "en",
  });
  assert.deepEqual(transport.capturedRequests[4]?.query, {
    lang: "en",
    queue: "queue-id",
    settings2: true,
  });
  assert.ok(status instanceof Status);
  assert.ok(dashboard instanceof Dashboard);
  assert.ok(dashboard.stations?.[0] instanceof Station);
  assert.ok(list[0] instanceof StationResult);
  assert.ok(list[0]?.station instanceof Station);
  assert.ok(info[0] instanceof StationResult);
  assert.ok(tracks instanceof StationTracksResult);
  assert.ok(tracks.tracks?.[0] instanceof Track);
});

test("history.musicHistory builds the history endpoint and parses MusicHistory", async () => {
  const transport = new QueueTransport([
    {
      body: {
        result: {
          generated_at: "2026-05-13T10:00:00Z",
          entries: [
            {
              id: 1,
              track: { id: 11, title: "Played" },
            },
          ],
        },
      },
      headers: {},
      status: 200,
      statusText: "OK",
      url: "https://api.music.yandex.net/music-history",
    },
  ]);
  const resource = new HistoryResource(transport);
  const history = await resource.musicHistory({ language: "en" });

  assert.equal(transport.capturedRequests[0]?.path, "/music-history");
  assert.deepEqual(transport.capturedRequests[0]?.query, {
    fullModelsCount: undefined,
    lang: "en",
  });
  assert.ok(history instanceof MusicHistory);
  assert.ok(history.lastTrack instanceof Track);
  assert.equal(history.generatedAt, "2026-05-13T10:00:00Z");
});
