import type { DeepReadonly, JsonObject } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject } from "../../core/parsing.ts";

export interface ConcertMinPriceShape extends Record<string, unknown> {
  amount?: number;
  currency?: string;
}

export class ConcertMinPrice {
  declare readonly amount?: number;
  declare readonly currency?: string;

  constructor(shape: ConcertMinPriceShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends ConcertMinPrice>(
    this: new (shape: ConcertMinPriceShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    return new this(normalizeObject(json));
  }
}
