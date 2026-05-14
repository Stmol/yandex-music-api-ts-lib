import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject, parseOptionalJsonObject } from "../../core/parsing.ts";
import { TrailerInfo } from "../shared/TrailerInfo.ts";

export interface TrackTrailerShape extends Record<string, unknown> {
  trailerInfo?: TrailerInfo | null;
}

export class TrackTrailer {
  declare readonly trailerInfo?: TrailerInfo | null;

  constructor(shape: TrackTrailerShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends TrackTrailer>(
    this: new (shape: TrackTrailerShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeObject(json) as Record<string, JsonValue>;
    const shape: TrackTrailerShape = { ...normalized };
    const trailerInfo = parseOptionalJsonObject(normalized.trailerInfo, "$.trailerInfo", (entry) =>
      TrailerInfo.fromJSON(entry));

    if (trailerInfo !== undefined) shape.trailerInfo = trailerInfo;

    return new this(shape);
  }
}
