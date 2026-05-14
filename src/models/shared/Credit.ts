import type { DeepReadonly, JsonObject } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject } from "../../core/parsing.ts";

export interface CreditShape extends Record<string, unknown> {
  role?: string;
  name?: string;
  id?: string | number;
}

export class Credit {
  declare readonly role?: string;
  declare readonly name?: string;
  declare readonly id?: string | number;

  constructor(shape: CreditShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends Credit>(
    this: new (shape: CreditShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    return new this(normalizeObject(json) as CreditShape);
  }
}
