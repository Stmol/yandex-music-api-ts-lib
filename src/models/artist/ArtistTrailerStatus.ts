import type { DeepReadonly, JsonObject } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject } from "../../core/parsing.ts";

export interface ArtistTrailerStatusShape extends Record<string, unknown> {
  available?: boolean;
  status?: string;
}

export class ArtistTrailerStatus {
  declare readonly available?: boolean;
  declare readonly status?: string;

  constructor(shape: ArtistTrailerStatusShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends ArtistTrailerStatus>(
    this: new (shape: ArtistTrailerStatusShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    return new this(normalizeObject(json));
  }
}
