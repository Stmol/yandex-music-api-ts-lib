import assert from "node:assert/strict";
import test from "node:test";

import { YandexMusicClient } from "../../src/client.ts";
import type { HttpRequest, HttpResponse, HttpTransport } from "../../src/http/types.ts";

class RecordingTransport implements HttpTransport {
  readonly requests: HttpRequest[] = [];

  async request(request: HttpRequest): Promise<HttpResponse> {
    this.requests.push(request);

    if (request.path === "/account/status") {
      return {
        body: {
          result: {
            account: {
              display_name: "Listener",
              uid: 501,
            },
            plus: {
              has_plus: true,
            },
          },
        },
        headers: {},
        status: 200,
        statusText: "OK",
        url: "https://api.music.yandex.net/account/status",
      };
    }

    if (request.path === "/search") {
      return {
        body: {
          result: {
            text: "Muse",
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
      };
    }

    if (request.path === "/users/501/likes/albums/add-multiple") {
      return {
        body: {
          result: "ok",
        },
        headers: {},
        status: 200,
        statusText: "OK",
        url: "https://api.music.yandex.net/users/501/likes/albums/add-multiple",
      };
    }

    throw new Error(`Unexpected request path: ${request.path ?? "<missing>"}`);
  }
}

test("YandexMusicClient uses FetchTransport by default and remains immutable", async () => {
  const capturedRequests: Request[] = [];
  const client = new YandexMusicClient({
    fetch: async (input, init) => {
      const request = new Request(input, init);

      capturedRequests.push(request);

      return new Response(
        JSON.stringify({
          result: {
            account: {
              display_name: "Listener",
              uid: 501,
            },
            plus: {
              has_plus: true,
            },
          },
        }),
        {
          headers: {
            "content-type": "application/json",
          },
          status: 200,
          statusText: "OK",
        },
      );
    },
    oauthToken: "token-123",
  });

  const status = await client.account.status({ language: "en" });

  assert.equal(Object.isFrozen(client), true);
  assert.equal(Reflect.set(client as unknown as Record<string, unknown>, "account", null), false);
  assert.equal(client.account, client.account);
  assert.equal(client.artists, client.artists);
  assert.equal(client.landing, client.landing);
  assert.equal(client.likes, client.likes);
  assert.equal(client.playlists, client.playlists);
  assert.equal(client.search, client.search);
  assert.equal(client.tracks, client.tracks);
  assert.equal(capturedRequests.length, 1);
  assert.equal(capturedRequests[0]?.url, "https://api.music.yandex.net/account/status?lang=en");
  assert.equal(capturedRequests[0]?.headers.get("authorization"), "OAuth token-123");
  assert.equal(status.account?.displayName, "Listener");
  assert.equal(status.hasActiveSubscription, true);
});

test("YandexMusicClient wires all resources through the provided transport", async () => {
  const transport = new RecordingTransport();
  const client = new YandexMusicClient({ transport });

  const status = await client.account.status({ language: "en" });
  const search = await client.search.search("Muse", {
    language: "en",
    type: "track",
  });
  const liked = await client.likes.addAlbums([1], { userId: 501 });

  assert.equal(transport.requests.length, 3);
  assert.equal(transport.requests[0]?.path, "/account/status");
  assert.equal(transport.requests[1]?.path, "/search");
  assert.equal(transport.requests[2]?.path, "/users/501/likes/albums/add-multiple");
  assert.deepEqual(transport.requests[0]?.query, {
    lang: "en",
  });
  assert.deepEqual(transport.requests[1]?.query, {
    lang: "en",
    nocorrect: undefined,
    page: undefined,
    "page-size": undefined,
    "playlist-in-best": undefined,
    text: "Muse",
    type: "track",
  });
  assert.equal(status.hasActiveSubscription, true);
  assert.equal(search.tracks?.items?.length, 1);
  assert.equal(liked, true);
});
