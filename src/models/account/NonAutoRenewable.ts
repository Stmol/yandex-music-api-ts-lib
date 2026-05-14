import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject, parseOptionalJsonObject } from "../../core/parsing.ts";
import { Product } from "./Product.ts";

export interface NonAutoRenewableShape extends Record<string, unknown> {
  product?: Product | null;
  productId?: string;
  start?: string;
  end?: string;
  finished?: boolean;
}

export class NonAutoRenewable {
  declare readonly product?: Product | null;
  declare readonly productId?: string;
  declare readonly start?: string;
  declare readonly end?: string;
  declare readonly finished?: boolean;

  constructor(shape: NonAutoRenewableShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends NonAutoRenewable>(
    this: new (shape: NonAutoRenewableShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeObject(json) as Record<string, JsonValue>;
    const shape: NonAutoRenewableShape = { ...normalized };
    const product = parseOptionalJsonObject(normalized.product, "$.product", (entry) =>
      Product.fromJSON(entry));

    if (product !== undefined) shape.product = product;

    return new this(shape);
  }
}
