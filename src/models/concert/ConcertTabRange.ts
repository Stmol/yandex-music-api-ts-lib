import type { DeepReadonly, JsonObject } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject } from "../../core/parsing.ts";

export interface ConcertTabRangeShape extends Record<string, unknown> {
  from?: string;
  to?: string;
}

export class ConcertTabRange {
  declare readonly from?: string;
  declare readonly to?: string;

  constructor(shape: ConcertTabRangeShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends ConcertTabRange>(
    this: new (shape: ConcertTabRangeShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    return new this(normalizeObject(json));
  }
}
