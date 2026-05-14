import type { DeepReadonly, JsonObject } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject } from "../../core/parsing.ts";

export interface DeprecationShape extends Record<string, unknown> {
  targetAlbumId?: string | number;
  done?: boolean;
}

export class Deprecation {
  declare readonly targetAlbumId?: string | number;
  declare readonly done?: boolean;

  constructor(shape: DeprecationShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends Deprecation>(
    this: new (shape: DeprecationShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    return new this(normalizeObject(json) as DeprecationShape);
  }
}
