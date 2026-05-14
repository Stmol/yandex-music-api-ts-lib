import type { DeepReadonly, JsonObject } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject } from "../../core/parsing.ts";

export interface SkeletonSourceShape extends Record<string, unknown> {
  type?: string;
  uri?: string;
}

export class SkeletonSource {
  declare readonly type?: string;
  declare readonly uri?: string;

  constructor(shape: SkeletonSourceShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends SkeletonSource>(
    this: new (shape: SkeletonSourceShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    return new this(normalizeObject(json));
  }
}
