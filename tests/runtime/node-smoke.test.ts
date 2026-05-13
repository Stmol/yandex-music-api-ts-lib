import assert from "node:assert/strict";
import test from "node:test";

import { Status, YandexMusicClient, type HttpRequest, type HttpResponse, type HttpTransport } from "../../src/index.ts";
import { TrackShort } from "../../src/models/index.ts";

class SmokeTransport implements HttpTransport {
  readonly requests: HttpRequest[] = [];

  async request(request: HttpRequest): Promise<HttpResponse> {
    this.requests.push(request);

    return {
      body: {
        result: {
          account: {
            display_name: "Node Listener",
            uid: 101,
          },
          plus: {
            has_plus: true,
          },
        },
      },
      headers: {},
      status: 200,
      statusText: "OK",
      url: "https://api.music.yandex.net/users/account/status",
    };
  }
}

test("Node.js can import the package entrypoints and use a custom transport", async () => {
  const transport = new SmokeTransport();
  const client = new YandexMusicClient({ transport });

  const status = await client.account.status({ language: "en" });
  const track = TrackShort.fromJSON({
    id: "track-1",
    title: "Runtime Smoke",
  });

  assert.equal(status instanceof Status, true);
  assert.equal(status.account?.displayName, "Node Listener");
  assert.equal(status.hasActiveSubscription, true);
  assert.equal(track.title, "Runtime Smoke");
  assert.equal(transport.requests.length, 1);
  assert.equal(transport.requests[0]?.path, "/users/account/status");
  assert.deepEqual(transport.requests[0]?.query, {
    lang: "en",
  });
});
