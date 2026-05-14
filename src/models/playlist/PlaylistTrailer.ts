import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject, parseOptionalJsonObject } from "../../core/parsing.ts";
import { TrailerInfo } from "../shared/TrailerInfo.ts";

export interface PlaylistTrailerShape extends Record<string, unknown> {
  trailerInfo?: TrailerInfo | null;
}

export class PlaylistTrailer {
  declare readonly trailerInfo?: TrailerInfo | null;

  constructor(shape: PlaylistTrailerShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends PlaylistTrailer>(
    this: new (shape: PlaylistTrailerShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeObject(json) as Record<string, JsonValue>;
    const shape: PlaylistTrailerShape = { ...normalized };
    const trailerInfo = parseOptionalJsonObject(normalized.trailerInfo, "$.trailerInfo", (entry) =>
      TrailerInfo.fromJSON(entry));

    if (trailerInfo !== undefined) shape.trailerInfo = trailerInfo;

    return new this(shape);
  }
}
