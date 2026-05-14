import type { DeepReadonly, JsonObject } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject } from "../../core/parsing.ts";

export interface RatingsShape extends Record<string, unknown> {
  week?: number;
  month?: number;
  day?: number;
}

export class Ratings {
  declare readonly week?: number;
  declare readonly month?: number;
  declare readonly day?: number;

  constructor(shape: RatingsShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends Ratings>(
    this: new (shape: RatingsShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    return new this(normalizeObject(json));
  }
}
