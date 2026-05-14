import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject, parseOptionalJsonObject, parseOptionalJsonObjectArray } from "../../core/parsing.ts";
import { Track } from "../track/Track.ts";

export interface QueueShape extends Record<string, unknown> {
  id?: string;
  context?: JsonValue;
  currentIndex?: number;
  modified?: string;
  tracks?: readonly Track[];
  current?: Track | null;
}

export class Queue {
  declare readonly id?: string;
  declare readonly context?: JsonValue;
  declare readonly currentIndex?: number;
  declare readonly modified?: string;
  declare readonly tracks?: readonly Track[];
  declare readonly current?: Track | null;

  constructor(shape: QueueShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends Queue>(
    this: new (shape: QueueShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeObject(json) as Record<string, JsonValue>;
    const shape: QueueShape = { ...normalized };
    const tracks = parseOptionalJsonObjectArray(normalized.tracks, "$.tracks", (entry) =>
      Track.fromJSON(entry));
    const current = parseOptionalJsonObject(normalized.current, "$.current", (entry) =>
      Track.fromJSON(entry));

    if (tracks !== undefined) {
      shape.tracks = tracks;
    }

    if (current !== undefined) shape.current = current;

    return new this(shape);
  }

  get currentTrack(): Track | null {
    if (this.current !== undefined && this.current !== null) {
      return this.current;
    }

    if (this.tracks === undefined || typeof this.currentIndex !== "number") {
      return null;
    }

    return this.tracks[this.currentIndex] ?? null;
  }
}
