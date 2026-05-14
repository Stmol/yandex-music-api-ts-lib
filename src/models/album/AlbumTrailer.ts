import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject, parseOptionalJsonObject } from "../../core/parsing.ts";
import { TrailerInfo } from "../shared/TrailerInfo.ts";

export interface AlbumTrailerShape extends Record<string, unknown> {
  trailerInfo?: TrailerInfo | null;
}

export class AlbumTrailer {
  declare readonly trailerInfo?: TrailerInfo | null;

  constructor(shape: AlbumTrailerShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends AlbumTrailer>(
    this: new (shape: AlbumTrailerShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeObject(json) as Record<string, JsonValue>;
    const shape: AlbumTrailerShape = { ...normalized };
    const trailerInfo = parseOptionalJsonObject(normalized.trailerInfo, "$.trailerInfo", (entry) =>
      TrailerInfo.fromJSON(entry));

    if (trailerInfo !== undefined) shape.trailerInfo = trailerInfo;

    return new this(shape);
  }
}
