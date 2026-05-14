import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject, parseOptionalJsonObjectArray } from "../../core/parsing.ts";
import { Track } from "./Track.ts";

export interface SimilarTracksShape extends Record<string, unknown> {
  similarTracks?: readonly Track[];
  tracks?: readonly Track[];
}

export class SimilarTracks {
  declare readonly similarTracks?: readonly Track[];
  declare readonly tracks?: readonly Track[];

  constructor(shape: SimilarTracksShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends SimilarTracks>(
    this: new (shape: SimilarTracksShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeObject(json) as Record<string, JsonValue>;
    const shape: SimilarTracksShape = { ...normalized };
    const similarTracks = parseOptionalJsonObjectArray(normalized.similarTracks, "$.similarTracks", (entry) =>
      Track.fromJSON(entry));
    const tracks = parseOptionalJsonObjectArray(normalized.tracks, "$.tracks", (entry) =>
      Track.fromJSON(entry));

    if (similarTracks !== undefined) shape.similarTracks = similarTracks;
    if (tracks !== undefined) shape.tracks = tracks;

    return new this(shape);
  }
}
