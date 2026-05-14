import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject, parseOptionalJsonObjectArray } from "../../core/parsing.ts";
import { Track } from "../track/Track.ts";

export interface PlaylistRecommendationsShape extends Record<string, unknown> {
  tracks?: readonly Track[];
  batchId?: string;
}

export class PlaylistRecommendations {
  declare readonly tracks?: readonly Track[];
  declare readonly batchId?: string;

  constructor(shape: PlaylistRecommendationsShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends PlaylistRecommendations>(
    this: new (shape: PlaylistRecommendationsShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeObject(json) as Record<string, JsonValue>;
    const shape: PlaylistRecommendationsShape = { ...normalized };
    const tracks = parseOptionalJsonObjectArray(normalized.tracks, "$.tracks", (entry) =>
      Track.fromJSON(entry));

    if (tracks !== undefined) shape.tracks = tracks;

    return new this(shape);
  }
}
