import type { DeepReadonly, JsonObject } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject } from "../../core/parsing.ts";

export interface SkeletonBlockDataShape extends Record<string, unknown> {
  title?: string;
}

export class SkeletonBlockData {
  declare readonly title?: string;

  constructor(shape: SkeletonBlockDataShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends SkeletonBlockData>(
    this: new (shape: SkeletonBlockDataShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    return new this(normalizeObject(json));
  }
}
