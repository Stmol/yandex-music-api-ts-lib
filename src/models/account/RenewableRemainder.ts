import type { DeepReadonly, JsonObject } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject } from "../../core/parsing.ts";

export interface RenewableRemainderShape extends Record<string, unknown> {
  days?: number;
  text?: string;
  hasDiscount?: boolean;
}

export class RenewableRemainder {
  declare readonly days?: number;
  declare readonly text?: string;
  declare readonly hasDiscount?: boolean;

  constructor(shape: RenewableRemainderShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends RenewableRemainder>(
    this: new (shape: RenewableRemainderShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    return new this(normalizeObject(json));
  }
}
