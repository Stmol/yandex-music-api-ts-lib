import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject, parseOptionalJsonObject } from "../../core/parsing.ts";
import { Price } from "./Price.ts";
import { Product } from "./Product.ts";
import { RenewableRemainder } from "./RenewableRemainder.ts";

export interface AutoRenewableShape extends Record<string, unknown> {
  product?: Product | null;
  productId?: string;
  price?: Price | null;
  expires?: string;
  finished?: boolean;
  renewableRemainder?: RenewableRemainder | null;
}

export class AutoRenewable {
  declare readonly product?: Product | null;
  declare readonly productId?: string;
  declare readonly price?: Price | null;
  declare readonly expires?: string;
  declare readonly finished?: boolean;
  declare readonly renewableRemainder?: RenewableRemainder | null;

  constructor(shape: AutoRenewableShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends AutoRenewable>(
    this: new (shape: AutoRenewableShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeObject(json) as Record<string, JsonValue>;
    const shape: AutoRenewableShape = { ...normalized };
    const product = parseOptionalJsonObject(normalized.product, "$.product", (entry) =>
      Product.fromJSON(entry));
    const price = parseOptionalJsonObject(normalized.price, "$.price", (entry) =>
      Price.fromJSON(entry));
    const renewableRemainder = parseOptionalJsonObject(
      normalized.renewableRemainder,
      "$.renewableRemainder",
      (entry) => RenewableRemainder.fromJSON(entry),
    );

    if (product !== undefined) shape.product = product;
    if (price !== undefined) shape.price = price;
    if (renewableRemainder !== undefined) shape.renewableRemainder = renewableRemainder;

    return new this(shape);
  }
}
