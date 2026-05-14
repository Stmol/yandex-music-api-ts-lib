import { ApiSchemaError } from "../../core/errors.ts";
import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { expectJsonArray, normalizeObject } from "../../core/parsing.ts";
import { parseSearchBestResult } from "./BestResult.ts";
import type { SearchBestResultShape } from "./Search.ts";

export interface SuggestionsShape extends Record<string, unknown> {
  best?: SearchBestResultShape | null;
  suggestions?: readonly string[];
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

function parseStringArray(value: JsonValue | undefined): readonly string[] | undefined {
  if (value === undefined) {
    return undefined;
  }

  return expectJsonArray(value, "$.suggestions").map((entry, index) => {
    if (typeof entry !== "string") {
      const path = `$.suggestions[${index}]`;

      throw new ApiSchemaError(`Expected string at ${path}, received ${describeValue(entry)}.`, {
        details: entry,
        expected: "string",
        path,
        received: entry,
      });
    }

    return entry;
  });
}

export class Suggestions {
  declare readonly best?: SearchBestResultShape | null;
  declare readonly suggestions?: readonly string[];

  constructor(shape: SuggestionsShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends Suggestions>(
    this: new (shape: SuggestionsShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeObject(json) as Record<string, JsonValue>;
    const shape: SuggestionsShape = { ...normalized };
    const best = parseSearchBestResult(normalized.best);
    const suggestions = parseStringArray(normalized.suggestions);

    if (best !== undefined) {
      shape.best = best;
    }

    if (suggestions !== undefined) {
      shape.suggestions = suggestions;
    }

    return new this(shape);
  }
}
