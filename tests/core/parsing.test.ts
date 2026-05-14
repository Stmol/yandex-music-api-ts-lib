import assert from "node:assert/strict";
import test from "node:test";

import { ApiSchemaError } from "../../src/core/errors.ts";
import { expectJsonObject, parseJsonObjectArray } from "../../src/core/parsing.ts";
import { Album } from "../../src/models/album/Album.ts";
import { Artist } from "../../src/models/artist/Artist.ts";
import { Search } from "../../src/models/search/Search.ts";
import { Suggestions } from "../../src/models/search/Suggestions.ts";
import { TracksList } from "../../src/models/shared/TracksList.ts";

test("expectJsonObject throws path-aware ApiSchemaError for invalid values", () => {
  assert.throws(
    () => expectJsonObject(null, "$.result", { status: 200, url: "https://api.music.yandex.net/test" }),
    (error: unknown) => {
      assert.ok(error instanceof ApiSchemaError);
      assert.equal(error.path, "$.result");
      assert.equal(error.expected, "object");
      assert.equal(error.status, 200);
      assert.equal(error.url, "https://api.music.yandex.net/test");
      assert.equal(error.received, null);
      return true;
    },
  );
});

test("parseJsonObjectArray rejects non-object array entries", () => {
  assert.throws(
    () => parseJsonObjectArray([{ ok: true }, "bad"], "$.items", (item) => item),
    (error: unknown) => {
      assert.ok(error instanceof ApiSchemaError);
      assert.equal(error.path, "$.items[1]");
      assert.equal(error.expected, "object");
      assert.equal(error.received, "bad");
      return true;
    },
  );
});

test("search best result parser does not expose raw objects for unknown result types", () => {
  const search = Search.fromJSON({
    best: {
      type: "unknown",
      result: {
        id: 1,
      },
    },
    artists: null,
  });
  const suggestions = Suggestions.fromJSON({
    best: {
      type: "unknown",
      result: {
        id: 2,
      },
    },
  });

  assert.equal(search.best?.result, null);
  assert.equal(search.artists, null);
  assert.equal(suggestions.best?.result, null);
});

test("model array parsers reject invalid array shapes instead of dropping entries", () => {
  assert.throws(
    () => Album.fromJSON({ volumes: [{ id: 1 }] }),
    (error: unknown) => {
      assert.ok(error instanceof ApiSchemaError);
      assert.equal(error.path, "$.volumes[0]");
      assert.equal(error.expected, "array");
      return true;
    },
  );

  assert.throws(
    () => TracksList.fromJSON({ track_ids: ["11:22", false] }),
    (error: unknown) => {
      assert.ok(error instanceof ApiSchemaError);
      assert.equal(error.path, "$.trackIds[1]");
      assert.equal(error.expected, "string or number");
      assert.equal(error.received, false);
      return true;
    },
  );
});

test("artist links parser rejects invalid link entries and containers", () => {
  assert.throws(
    () => Artist.fromJSON({ links: [{ title: "Website" }, "bad"] }),
    (error: unknown) => {
      assert.ok(error instanceof ApiSchemaError);
      assert.equal(error.path, "$.links[1]");
      assert.equal(error.expected, "object");
      return true;
    },
  );

  assert.throws(
    () => Artist.fromJSON({ links: "bad" }),
    (error: unknown) => {
      assert.ok(error instanceof ApiSchemaError);
      assert.equal(error.path, "$.links");
      assert.equal(error.expected, "object");
      return true;
    },
  );
});
