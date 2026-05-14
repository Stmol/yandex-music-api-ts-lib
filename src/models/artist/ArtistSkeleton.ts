import type { DeepReadonly, JsonObject } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject } from "../../core/parsing.ts";

export interface ArtistSkeletonShape extends Record<string, unknown> {
  id?: string | number;
  name?: string;
}

export class ArtistSkeleton {
  declare readonly id?: string | number;
  declare readonly name?: string;

  constructor(shape: ArtistSkeletonShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends ArtistSkeleton>(
    this: new (shape: ArtistSkeletonShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    return new this(normalizeObject(json));
  }
}
