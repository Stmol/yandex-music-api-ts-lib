import test from "node:test";
import assert from "node:assert/strict";

import { normalizeTopLevelKey, normalizeTopLevelKeys, YandexMusicModel } from "../../src/models/index.ts";

class TestTrack extends YandexMusicModel<{
  trackId: number;
  title: string;
  coverUri: string | null;
}> {
  declare readonly trackId: number;
  declare readonly title: string;
  declare readonly coverUri: string | null;
}

test("normalizeTopLevelKey converts upstream keys to camelCase", () => {
  assert.equal(normalizeTopLevelKey("track_id"), "trackId");
  assert.equal(normalizeTopLevelKey("Cover-URI"), "coverURI");
  assert.equal(normalizeTopLevelKey(" title "), "title");
});

test("normalizeTopLevelKeys normalizes only the top level", () => {
  const payload = {
    track_id: 101,
    cover_uri: "avatars.yandex.net/image",
    nested_item: {
      album_id: 202,
    },
  } as const;

  const normalized = normalizeTopLevelKeys(payload);

  assert.deepEqual(normalized, {
    trackId: 101,
    coverUri: "avatars.yandex.net/image",
    nestedItem: {
      album_id: 202,
    },
  });
});

test("YandexMusicModel.fromJSON builds a typed model instance", () => {
  const track = TestTrack.fromJSON({
    track_id: 42,
    title: "Song",
    cover_uri: null,
  } as const);

  assert.ok(track instanceof TestTrack);
  assert.equal(track.trackId, 42);
  assert.equal(track.title, "Song");
  assert.equal(track.coverUri, null);
});
