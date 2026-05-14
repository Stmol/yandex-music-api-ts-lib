import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject, parseOptionalJsonObjectArray } from "../../core/parsing.ts";
import { Value } from "./Value.ts";

export interface DiscreteScaleShape extends Record<string, unknown> {
  type?: string;
  name?: string;
  values?: readonly Value[];
}

export class DiscreteScale {
  declare readonly type?: string;
  declare readonly name?: string;
  declare readonly values?: readonly Value[];

  constructor(shape: DiscreteScaleShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends DiscreteScale>(
    this: new (shape: DiscreteScaleShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeObject(json) as Record<string, JsonValue>;
    const shape: DiscreteScaleShape = { ...normalized };
    const values = parseOptionalJsonObjectArray(normalized.values, "$.values", (entry) =>
      Value.fromJSON(entry));

    if (values !== undefined) shape.values = values;

    return new this(shape);
  }
}
