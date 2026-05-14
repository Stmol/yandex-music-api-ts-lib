import type { DeepReadonly, JsonObject } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject } from "../../core/parsing.ts";

export interface SettingsShape extends Record<string, unknown> {
  inAppProducts?: readonly unknown[];
  nativeProducts?: readonly unknown[];
  webPaymentUrl?: string;
  promoCodesEnabled?: boolean;
}

export class Settings {
  declare readonly inAppProducts?: readonly unknown[];
  declare readonly nativeProducts?: readonly unknown[];
  declare readonly webPaymentUrl?: string;
  declare readonly promoCodesEnabled?: boolean;

  constructor(shape: SettingsShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends Settings>(
    this: new (shape: SettingsShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    return new this(normalizeObject(json));
  }
}
