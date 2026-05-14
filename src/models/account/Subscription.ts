import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject, parseOptionalJsonObject, parseOptionalJsonObjectArray } from "../../core/parsing.ts";
import { AutoRenewable } from "./AutoRenewable.ts";
import { NonAutoRenewable } from "./NonAutoRenewable.ts";
import { Plus } from "./Plus.ts";
import { Product } from "./Product.ts";
import { RenewableRemainder } from "./RenewableRemainder.ts";

export interface SubscriptionShape extends Record<string, unknown> {
  autoRenewable?: readonly AutoRenewable[];
  nonAutoRenewable?: readonly NonAutoRenewable[];
  products?: readonly Product[];
  plus?: Plus | null;
  renewableRemainder?: RenewableRemainder | null;
  hasPlus?: boolean;
  canStartTrial?: boolean;
}

export class Subscription {
  declare readonly autoRenewable?: readonly AutoRenewable[];
  declare readonly nonAutoRenewable?: readonly NonAutoRenewable[];
  declare readonly products?: readonly Product[];
  declare readonly plus?: Plus | null;
  declare readonly renewableRemainder?: RenewableRemainder | null;
  declare readonly hasPlus?: boolean;
  declare readonly canStartTrial?: boolean;

  constructor(shape: SubscriptionShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends Subscription>(
    this: new (shape: SubscriptionShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeObject(json) as Record<string, JsonValue>;
    const shape: SubscriptionShape = { ...normalized };
    const autoRenewable = parseOptionalJsonObjectArray(
      normalized.autoRenewable,
      "$.autoRenewable",
      (entry) => AutoRenewable.fromJSON(entry),
    );
    const nonAutoRenewable = parseOptionalJsonObjectArray(
      normalized.nonAutoRenewable,
      "$.nonAutoRenewable",
      (entry) => NonAutoRenewable.fromJSON(entry),
    );
    const products = parseOptionalJsonObjectArray(normalized.products, "$.products", (entry) =>
      Product.fromJSON(entry));
    const plus = parseOptionalJsonObject(normalized.plus, "$.plus", (entry) =>
      Plus.fromJSON(entry));
    const renewableRemainder = parseOptionalJsonObject(
      normalized.renewableRemainder,
      "$.renewableRemainder",
      (entry) => RenewableRemainder.fromJSON(entry),
    );

    if (autoRenewable !== undefined) shape.autoRenewable = autoRenewable;
    if (nonAutoRenewable !== undefined) shape.nonAutoRenewable = nonAutoRenewable;
    if (products !== undefined) shape.products = products;
    if (plus !== undefined) shape.plus = plus;
    if (renewableRemainder !== undefined) shape.renewableRemainder = renewableRemainder;

    return new this(shape);
  }
}
