import type { DeepReadonly, JsonObject } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject } from "../../core/parsing.ts";

export interface AdParamsShape extends Record<string, unknown> {
  partnerId?: string;
  categoryId?: string;
}

export class AdParams {
  declare readonly partnerId?: string;
  declare readonly categoryId?: string;

  constructor(shape: AdParamsShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends AdParams>(
    this: new (shape: AdParamsShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    return new this(normalizeObject(json));
  }
}
