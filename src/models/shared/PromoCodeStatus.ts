import type { DeepReadonly, JsonObject } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject } from "../../core/parsing.ts";

export interface PromoCodeStatusShape extends Record<string, unknown> {
  status?: string;
  statusDesc?: string;
  canUse?: boolean;
  endDate?: string;
}

export class PromoCodeStatus {
  declare readonly status?: string;
  declare readonly statusDesc?: string;
  declare readonly canUse?: boolean;
  declare readonly endDate?: string;

  constructor(shape: PromoCodeStatusShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends PromoCodeStatus>(
    this: new (shape: PromoCodeStatusShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    return new this(normalizeObject(json));
  }
}
