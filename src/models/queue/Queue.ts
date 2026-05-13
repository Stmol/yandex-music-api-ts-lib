import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { normalizeTopLevelKeys } from "../../core/normalize.ts";
import { Track } from "../track/Track.ts";

export interface QueueShape extends Record<string, unknown> {
  id?: string;
  context?: JsonValue;
  currentIndex?: number;
  modified?: string;
  tracks?: readonly Track[];
  current?: Track | null;
}

function isJsonObject(value: JsonValue | undefined): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseTracks(value: JsonValue | undefined): readonly Track[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  return value.filter(isJsonObject).map((entry) => Track.fromJSON(entry));
}

export class Queue {
  declare readonly id?: string;
  declare readonly context?: JsonValue;
  declare readonly currentIndex?: number;
  declare readonly modified?: string;
  declare readonly tracks?: readonly Track[];
  declare readonly current?: Track | null;

  constructor(shape: QueueShape) {
    Object.assign(this, shape);
  }

  static fromJSON<TModel extends Queue>(
    this: new (shape: QueueShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeTopLevelKeys(json) as Record<string, JsonValue>;
    const shape: QueueShape = { ...normalized };
    const tracks = parseTracks(normalized.tracks);

    if (tracks !== undefined) {
      shape.tracks = tracks;
    }

    if (isJsonObject(normalized.current)) {
      shape.current = Track.fromJSON(normalized.current);
    }

    return new this(shape);
  }

  get currentTrack(): Track | null {
    if (this.current !== undefined && this.current !== null) {
      return this.current;
    }

    if (!Array.isArray(this.tracks) || typeof this.currentIndex !== "number") {
      return null;
    }

    return this.tracks[this.currentIndex] ?? null;
  }
}
