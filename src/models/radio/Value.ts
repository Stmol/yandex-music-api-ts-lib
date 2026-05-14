import type { DeepReadonly, JsonObject } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject } from "../../core/parsing.ts";

export interface ValueShape extends Record<string, unknown> {
  value?: string;
  name?: string;
}

export class Value {
  declare readonly value?: string;
  declare readonly name?: string;

  constructor(shape: ValueShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends Value>(
    this: new (shape: ValueShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    return new this(normalizeObject(json));
  }
}
