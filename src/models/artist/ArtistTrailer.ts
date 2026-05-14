import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { isJsonObject, normalizeObject, parseOptionalJsonObject } from "../../core/parsing.ts";
import { ArtistTrailerStatus } from "./ArtistTrailerStatus.ts";

export interface ArtistTrailerShape extends Record<string, unknown> {
  status?: ArtistTrailerStatus | string | null;
}

export class ArtistTrailer {
  declare readonly status?: ArtistTrailerStatus | string | null;

  constructor(shape: ArtistTrailerShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends ArtistTrailer>(
    this: new (shape: ArtistTrailerShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeObject(json) as Record<string, JsonValue>;
    const shape: ArtistTrailerShape = { ...normalized };
    const status = isJsonObject(normalized.status)
      ? parseOptionalJsonObject(normalized.status, "$.status", (entry) =>
          ArtistTrailerStatus.fromJSON(entry))
      : undefined;

    if (status !== undefined) shape.status = status;

    return new this(shape);
  }
}
