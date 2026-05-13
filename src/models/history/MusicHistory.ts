import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject, parseOptionalJsonObject, parseOptionalJsonObjectArray } from "../../core/parsing.ts";
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

function parseEntries(value: JsonValue | undefined): readonly MusicHistoryEntryShape[] | undefined {
  return parseOptionalJsonObjectArray(
    value,
    "$.entries",
    (entry, path) => {
      const normalized = normalizeObject(entry) as Record<string, JsonValue>;
      const shape: MusicHistoryEntryShape = { ...normalized };
      const track = parseOptionalJsonObject(normalized.track, `${path}.track`, (trackEntry) =>
        Track.fromJSON(trackEntry));

      if (track !== undefined) shape.track = track;

      return shape;
    },
  );
}

export class MusicHistory {
  declare readonly generatedAt?: string;
  declare readonly entries?: readonly MusicHistoryEntryShape[];

  constructor(shape: MusicHistoryShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends MusicHistory>(
    this: new (shape: MusicHistoryShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeObject(json) as Record<string, JsonValue>;
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
