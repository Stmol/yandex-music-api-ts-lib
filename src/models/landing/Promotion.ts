import type { DeepReadonly, JsonObject } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject } from "../../core/parsing.ts";

export interface PromotionShape extends Record<string, unknown> {
  title?: string;
  text?: string;
  url?: string;
}

export class Promotion {
  declare readonly title?: string;
  declare readonly text?: string;
  declare readonly url?: string;

  constructor(shape: PromotionShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends Promotion>(
    this: new (shape: PromotionShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    return new this(normalizeObject(json));
  }
}
