import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject, parseOptionalJsonObject } from "../../core/parsing.ts";
import { Operator } from "./Operator.ts";

export interface PassportPhoneShape extends Record<string, unknown> {
  phone?: string;
  login?: string;
  operator?: Operator | null;
}

export class PassportPhone {
  declare readonly phone?: string;
  declare readonly login?: string;
  declare readonly operator?: Operator | null;

  constructor(shape: PassportPhoneShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends PassportPhone>(
    this: new (shape: PassportPhoneShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeObject(json) as Record<string, JsonValue>;
    const shape: PassportPhoneShape = { ...normalized };
    const operator = parseOptionalJsonObject(normalized.operator, "$.operator", (entry) =>
      Operator.fromJSON(entry));

    if (operator !== undefined) shape.operator = operator;

    return new this(shape);
  }
}
