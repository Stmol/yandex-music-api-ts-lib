import test from "node:test";
import assert from "node:assert/strict";

import type {
  DeepReadonly,
  JsonArray,
  JsonObject,
  JsonPrimitive,
  JsonValue,
  NormalizeTopLevelKeys,
} from "../../src/models/index.ts";

type AssertTrue<TValue extends true> = TValue;
type IsEqual<TLeft, TRight> =
  (<TValue>() => TValue extends TLeft ? 1 : 2) extends
  (<TValue>() => TValue extends TRight ? 1 : 2)
    ? true
    : false;

type PrimitiveCheck = AssertTrue<IsEqual<JsonPrimitive, string | number | boolean | null>>;
type ValueCheck = AssertTrue<
  IsEqual<JsonValue, JsonPrimitive | JsonObject | JsonArray>
>;
type NormalizeCheck = AssertTrue<
  IsEqual<
    NormalizeTopLevelKeys<{
      track_id: number;
      cover_uri: string | null;
      nested_value: { album_id: number };
    }>,
    {
      trackId: number;
      coverUri: string | null;
      nestedValue: { album_id: number };
    }
  >
>;
type ReadonlyCheck = AssertTrue<
  IsEqual<
    DeepReadonly<{
      items: [{ title: string }];
      nested: { count: number };
    }>,
    {
      readonly items: readonly [{ readonly title: string }];
      readonly nested: { readonly count: number };
    }
  >
>;

const primitiveCheck: PrimitiveCheck = true;
const valueCheck: ValueCheck = true;
const normalizeCheck: NormalizeCheck = true;
const readonlyCheck: ReadonlyCheck = true;

void primitiveCheck;
void valueCheck;
void normalizeCheck;
void readonlyCheck;

test("shared type assertions compile and runtime exports stay usable", () => {
  const sample: JsonValue = {
    title: "Track",
    duration: 180,
    nested: ["ok", null],
  };

  assert.deepEqual(sample, {
    title: "Track",
    duration: 180,
    nested: ["ok", null],
  });
});
