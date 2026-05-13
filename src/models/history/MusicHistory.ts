import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { normalizeTopLevelKeys } from "../../core/normalize.ts";
import { Track } from "../track/Track.ts";

export interface MusicHistoryEntryShape {
  id?: string | number;
  timestamp?: string;
  track?: Track | null;
}

export interface MusicHistoryShape extends Record<string, unknown> {
  generatedAt?: string;
  entries?: readonly MusicHistoryEntryShape[];
}

function isJsonObject(value: JsonValue | undefined): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseEntries(value: JsonValue | undefined): readonly MusicHistoryEntryShape[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  return value
    .filter(isJsonObject)
    .map((entry) => {
      const normalized = normalizeTopLevelKeys(entry) as Record<string, JsonValue>;
      const shape: MusicHistoryEntryShape = { ...normalized };

      if (isJsonObject(normalized.track)) {
        shape.track = Track.fromJSON(normalized.track);
      }

      return shape;
    });
}

export class MusicHistory {
  declare readonly generatedAt?: string;
  declare readonly entries?: readonly MusicHistoryEntryShape[];

  constructor(shape: MusicHistoryShape) {
    Object.assign(this, shape);
  }

  static fromJSON<TModel extends MusicHistory>(
    this: new (shape: MusicHistoryShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeTopLevelKeys(json) as Record<string, JsonValue>;
    const shape: MusicHistoryShape = { ...normalized };
    const entries = parseEntries(normalized.entries);

    if (entries !== undefined) {
      shape.entries = entries;
    }

    return new this(shape);
  }

  get lastTrack(): Track | null {
    for (const entry of this.entries ?? []) {
      if (entry.track !== undefined && entry.track !== null) {
        return entry.track;
      }
    }

    return null;
  }
}
