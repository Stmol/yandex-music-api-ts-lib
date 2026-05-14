import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject, parseOptionalJsonObject } from "../../core/parsing.ts";
import { Alert } from "./Alert.ts";
import { Price } from "./Price.ts";

export interface ProductShape extends Record<string, unknown> {
  productId?: string;
  type?: string;
  duration?: number | string;
  trialDuration?: number | string;
  price?: Price | null;
  commonPeriodDuration?: string;
  plus?: boolean;
  feature?: string;
  debug?: boolean;
  alert?: Alert | null;
}

export class Product {
  declare readonly productId?: string;
  declare readonly type?: string;
  declare readonly duration?: number | string;
  declare readonly trialDuration?: number | string;
  declare readonly price?: Price | null;
  declare readonly commonPeriodDuration?: string;
  declare readonly plus?: boolean;
  declare readonly feature?: string;
  declare readonly debug?: boolean;
  declare readonly alert?: Alert | null;

  constructor(shape: ProductShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends Product>(
    this: new (shape: ProductShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeObject(json) as Record<string, JsonValue>;
    const shape: ProductShape = { ...normalized };
    const price = parseOptionalJsonObject(normalized.price, "$.price", (entry) =>
      Price.fromJSON(entry));
    const alert = parseOptionalJsonObject(normalized.alert, "$.alert", (entry) =>
      Alert.fromJSON(entry));

    if (price !== undefined) shape.price = price;
    if (alert !== undefined) shape.alert = alert;

    return new this(shape);
  }
}
