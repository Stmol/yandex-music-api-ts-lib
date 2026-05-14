import type { DeepReadonly, JsonObject } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject } from "../../core/parsing.ts";

export interface ConcertSkeletonShape extends Record<string, unknown> {
  id?: string | number;
  title?: string;
}

export class ConcertSkeleton {
  declare readonly id?: string | number;
  declare readonly title?: string;

  constructor(shape: ConcertSkeletonShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends ConcertSkeleton>(
    this: new (shape: ConcertSkeletonShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    return new this(normalizeObject(json));
  }
}
