import { ApiSchemaError } from "./errors.ts";
import type { DeepReadonly, JsonObject, JsonValue } from "./json.ts";
import { normalizeTopLevelKeys, type NormalizeTopLevelKeys } from "./normalize.ts";

export interface SchemaContext {
  readonly status?: number;
  readonly url?: string;
}

function describeValue(value: unknown): string {
  if (value === null) {
    return "null";
  }

  if (Array.isArray(value)) {
    return "array";
  }

  return typeof value;
}

function schemaError(
  value: unknown,
  expected: string,
  path: string,
  context: SchemaContext = {},
): ApiSchemaError {
  const options = {
    details: value,
    expected,
    path,
    received: value,
    ...(context.status !== undefined ? { status: context.status } : {}),
    ...(context.url !== undefined ? { url: context.url } : {}),
  };

  return new ApiSchemaError(`Expected ${expected} at ${path}, received ${describeValue(value)}.`, {
    ...options,
  });
}

export function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function assertJsonObject(
  value: unknown,
  path: string,
  context?: SchemaContext,
): asserts value is JsonObject {
  if (!isJsonObject(value)) {
    throw schemaError(value, "object", path, context);
  }
}

export function expectJsonObject(
  value: unknown,
  path: string,
  context?: SchemaContext,
): JsonObject {
  assertJsonObject(value, path, context);

  return value;
}

export function expectJsonArray(
  value: unknown,
  path: string,
  context?: SchemaContext,
): readonly JsonValue[] {
  if (!Array.isArray(value)) {
    throw schemaError(value, "array", path, context);
  }

  return value;
}

export function parseJsonObjectArray<TItem>(
  value: unknown,
  path: string,
  parseItem: (item: JsonObject, path: string) => TItem,
  context?: SchemaContext,
): readonly TItem[] {
  return expectJsonArray(value, path, context).map((entry, index) =>
    parseItem(expectJsonObject(entry, `${path}[${index}]`, context), `${path}[${index}]`),
  );
}

export function parseOptionalJsonObject<TItem>(
  value: JsonValue | undefined,
  path: string,
  parseItem: (item: JsonObject, path: string) => TItem,
  context?: SchemaContext,
): TItem | null | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  return parseItem(expectJsonObject(value, path, context), path);
}

export function parseOptionalJsonObjectArray<TItem>(
  value: JsonValue | undefined,
  path: string,
  parseItem: (item: JsonObject, path: string) => TItem,
  context?: SchemaContext,
): readonly TItem[] | undefined {
  if (value === undefined) {
    return undefined;
  }

  return parseJsonObjectArray(value, path, parseItem, context);
}

export function normalizeObject<TValue extends JsonObject>(
  value: DeepReadonly<TValue>,
): NormalizeTopLevelKeys<TValue> {
  return normalizeTopLevelKeys(value as TValue);
}
