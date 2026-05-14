import type { DeepReadonly, JsonObject } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject } from "../../core/parsing.ts";

export interface PriceShape extends Record<string, unknown> {
  amount?: number;
  currency?: string;
  text?: string;
}

export class Price {
  declare readonly amount?: number;
  declare readonly currency?: string;
  declare readonly text?: string;

  constructor(shape: PriceShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends Price>(
    this: new (shape: PriceShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    return new this(normalizeObject(json));
  }
}
