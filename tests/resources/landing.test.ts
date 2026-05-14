import assert from "node:assert/strict";
import test from "node:test";

import type { HttpRequest, HttpResponse, HttpTransport } from "../../src/http/types.ts";
import { Day } from "../../src/models/feed/Day.ts";
import { Event } from "../../src/models/feed/Event.ts";
import { Feed } from "../../src/models/feed/Feed.ts";
import { Block } from "../../src/models/landing/Block.ts";
import { BlockEntity } from "../../src/models/landing/BlockEntity.ts";
import { ChartInfo } from "../../src/models/landing/ChartInfo.ts";
import { Landing } from "../../src/models/landing/Landing.ts";
import { LandingList } from "../../src/models/landing/LandingList.ts";
import { TagResult } from "../../src/models/landing/TagResult.ts";
import { Track } from "../../src/models/track/Track.ts";
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
            entities: [
              {
                type: "track",
                data: {
                  id: 11,
                  title: "Track",
                },
              },
            ],
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
  assert.ok(landing.blocks?.[0] instanceof Block);
  assert.ok(landing.blocks?.[0]?.entities?.[0] instanceof BlockEntity);
  assert.ok(landing.blocks?.[0]?.entities?.[0]?.data instanceof Track);
  assert.equal(landing.findBlock("playlists")?.title, "New playlists");
});

test("landing expanded read-only endpoints build paths and parse model results", async () => {
  const transport = new QueueTransport([
    {
      body: {
        result: {
          position: 1,
          listeners: 1000,
        },
      },
      headers: {},
      status: 200,
      statusText: "OK",
      url: "https://api.music.yandex.net/landing3/chart/world",
    },
    {
      body: {
        result: {
          title: "New releases",
          albums: [{ id: 31, title: "Album" }],
        },
      },
      headers: {},
      status: 200,
      statusText: "OK",
      url: "https://api.music.yandex.net/landing3/new-releases",
    },
    {
      body: {
        result: {
          title: "New playlists",
          playlists: [{ kind: 1, title: "Playlist" }],
        },
      },
      headers: {},
      status: 200,
      statusText: "OK",
      url: "https://api.music.yandex.net/landing3/new-playlists",
    },
    {
      body: {
        result: {
          title: "Podcasts",
          tracks: [{ id: 11, title: "Episode" }],
        },
      },
      headers: {},
      status: 200,
      statusText: "OK",
      url: "https://api.music.yandex.net/landing3/podcasts",
    },
    {
      body: {
        result: {
          tag: "summer",
          tracks: [{ id: 12, title: "Tag Track" }],
        },
      },
      headers: {},
      status: 200,
      statusText: "OK",
      url: "https://api.music.yandex.net/tags/summer/playlist-ids",
    },
    {
      body: {
        result: {
          generated_playlists: [{ kind: 2, title: "Daily" }],
          days: [{ day: "2026-05-13", events: [{ type: "track" }] }],
        },
      },
      headers: {},
      status: 200,
      statusText: "OK",
      url: "https://api.music.yandex.net/feed",
    },
    {
      body: {
        result: {
          is_wizard_passed: true,
        },
      },
      headers: {},
      status: 200,
      statusText: "OK",
      url: "https://api.music.yandex.net/feed/wizard/is-passed",
    },
  ]);
  const resource = new LandingResource(transport);

  const chart = await resource.chart("world", { language: "en" });
  const newReleases = await resource.newReleases({ language: "en" });
  const newPlaylists = await resource.newPlaylists({ language: "en" });
  const podcasts = await resource.podcasts({ language: "en" });
  const tags = await resource.tags("summer", { language: "en" });
  const feed = await resource.feed({ language: "en" });
  const isWizardPassed = await resource.feedWizardIsPassed({ language: "en" });

  assert.deepEqual(transport.capturedRequests.map((request) => request.path), [
    "/landing3/chart/world",
    "/landing3/new-releases",
    "/landing3/new-playlists",
    "/landing3/podcasts",
    "/tags/summer/playlist-ids",
    "/feed",
    "/feed/wizard/is-passed",
  ]);
  assert.deepEqual(transport.capturedRequests[0]?.query, {
    lang: "en",
  });
  assert.ok(chart instanceof ChartInfo);
  assert.ok(newReleases instanceof LandingList);
  assert.ok(newPlaylists instanceof LandingList);
  assert.ok(podcasts instanceof LandingList);
  assert.ok(podcasts.tracks?.[0] instanceof Track);
  assert.ok(tags instanceof TagResult);
  assert.ok(feed instanceof Feed);
  assert.ok(feed.days?.[0] instanceof Day);
  assert.ok(feed.days?.[0]?.events?.[0] instanceof Event);
  assert.equal(isWizardPassed, true);
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
