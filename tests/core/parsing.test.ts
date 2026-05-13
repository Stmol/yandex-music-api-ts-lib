import assert from "node:assert/strict";
import test from "node:test";

import { ApiSchemaError } from "../../src/core/errors.ts";
import { expectJsonObject, parseJsonObjectArray } from "../../src/core/parsing.ts";

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
