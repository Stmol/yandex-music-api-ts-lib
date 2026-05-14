import type { DeepReadonly, JsonObject } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject } from "../../core/parsing.ts";

export interface R128Shape extends Record<string, unknown> {
  i?: number;
  tp?: number;
}

export class R128 {
  declare readonly i?: number;
  declare readonly tp?: number;

  constructor(shape: R128Shape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends R128>(
    this: new (shape: R128Shape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    return new this(normalizeObject(json) as R128Shape);
  }
}
