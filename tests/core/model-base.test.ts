import test from "node:test";
import assert from "node:assert/strict";

import { normalizeTopLevelKey, normalizeTopLevelKeys } from "../../src/core/normalize.ts";

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
