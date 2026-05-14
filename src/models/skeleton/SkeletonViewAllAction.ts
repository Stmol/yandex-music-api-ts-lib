import type { DeepReadonly, JsonObject } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject } from "../../core/parsing.ts";

export interface SkeletonViewAllActionShape extends Record<string, unknown> {
  title?: string;
  url?: string;
}

export class SkeletonViewAllAction {
  declare readonly title?: string;
  declare readonly url?: string;

  constructor(shape: SkeletonViewAllActionShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends SkeletonViewAllAction>(
    this: new (shape: SkeletonViewAllActionShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    return new this(normalizeObject(json));
  }
}
