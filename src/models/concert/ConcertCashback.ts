import type { DeepReadonly, JsonObject } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject } from "../../core/parsing.ts";

export interface ConcertCashbackShape extends Record<string, unknown> {
  amount?: number;
  currency?: string;
}

export class ConcertCashback {
  declare readonly amount?: number;
  declare readonly currency?: string;

  constructor(shape: ConcertCashbackShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends ConcertCashback>(
    this: new (shape: ConcertCashbackShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    return new this(normalizeObject(json));
  }
}
