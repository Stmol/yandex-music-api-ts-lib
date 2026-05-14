import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject, parseOptionalJsonObject } from "../../core/parsing.ts";
import { Playlist } from "./Playlist.ts";

export interface PlaylistRecommendationShape extends Record<string, unknown> {
  playlist?: Playlist | null;
  type?: string;
  reason?: string;
}

export class PlaylistRecommendation {
  declare readonly playlist?: Playlist | null;
  declare readonly type?: string;
  declare readonly reason?: string;

  constructor(shape: PlaylistRecommendationShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends PlaylistRecommendation>(
    this: new (shape: PlaylistRecommendationShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeObject(json) as Record<string, JsonValue>;
    const shape: PlaylistRecommendationShape = { ...normalized };
    const playlist = parseOptionalJsonObject(normalized.playlist, "$.playlist", (entry) =>
      Playlist.fromJSON(entry));

    if (playlist !== undefined) shape.playlist = playlist;

    return new this(shape);
  }
}
