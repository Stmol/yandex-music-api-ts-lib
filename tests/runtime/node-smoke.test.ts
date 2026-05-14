import assert from "node:assert/strict";
import test from "node:test";

import {
  PlaylistDiffBuilder,
  Status,
  YandexMusicClient,
  type HttpRequest,
  type HttpResponse,
  type HttpTransport,
} from "../../src/index.ts";
import { Clip, Concert, Label, Metatag, TrackShort, Wave } from "../../src/models/index.ts";

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
  const diff = new PlaylistDiffBuilder().delete(0, 1);
  const track = TrackShort.fromJSON({
    id: "track-1",
    title: "Runtime Smoke",
  });

  assert.ok(Clip.fromJSON({ id: "clip-1" }) instanceof Clip);
  assert.ok(Concert.fromJSON({ id: "concert-1" }) instanceof Concert);
  assert.ok(Label.fromJSON({ id: "label-1" }) instanceof Label);
  assert.ok(Metatag.fromJSON({ id: "tag-1" }) instanceof Metatag);
  assert.ok(Wave.fromJSON({ id: "wave-1" }) instanceof Wave);
  assert.equal(status instanceof Status, true);
  assert.equal(status.account?.displayName, "Node Listener");
  assert.equal(status.hasActiveSubscription, true);
  assert.equal(track.title, "Runtime Smoke");
  assert.equal(diff.toJSON(), "[{\"from\":0,\"op\":\"delete\",\"to\":1}]");
  assert.equal(transport.requests.length, 1);
  assert.equal(transport.requests[0]?.path, "/users/account/status");
  assert.deepEqual(transport.requests[0]?.query, {
    lang: "en",
  });
});
