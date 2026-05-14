import type { DeepReadonly, JsonObject } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject } from "../../core/parsing.ts";

export interface LyricsMajorShape extends Record<string, unknown> {
  id?: string | number;
  name?: string;
}

export class LyricsMajor {
  declare readonly id?: string | number;
  declare readonly name?: string;

  constructor(shape: LyricsMajorShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends LyricsMajor>(
    this: new (shape: LyricsMajorShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    return new this(normalizeObject(json));
  }
}
