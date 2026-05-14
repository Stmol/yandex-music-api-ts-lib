import { ApiSchemaError } from "../../core/errors.ts";
import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { expectJsonArray, expectJsonObject, normalizeObject } from "../../core/parsing.ts";
import { Album } from "../album/Album.ts";
import { Artist } from "../artist/Artist.ts";
import { Playlist } from "../playlist/Playlist.ts";
import { Track } from "../track/Track.ts";
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

function parseBestResult(value: JsonValue | undefined): SearchBestResultShape | null | undefined {
  if (value === undefined || value === null) {
    return value;
  }

  const normalized = normalizeObject(expectJsonObject(value, "$.best")) as Record<string, JsonValue>;
  const shape: SearchBestResultShape = { ...normalized };

  if (normalized.result === undefined || normalized.result === null) {
    return shape;
  }

  const result = expectJsonObject(normalized.result, "$.best.result");

  switch (normalized.type) {
    case "artist":
      shape.result = Artist.fromJSON(result);
      break;
    case "album":
      shape.result = Album.fromJSON(result);
      break;
    case "track":
      shape.result = Track.fromJSON(result);
      break;
    case "playlist":
      shape.result = Playlist.fromJSON(result);
      break;
    default:
      break;
  }

  return shape;
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
    const best = parseBestResult(normalized.best);
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
