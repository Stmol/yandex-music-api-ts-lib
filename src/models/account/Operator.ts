import type { DeepReadonly, JsonObject } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject } from "../../core/parsing.ts";

export interface OperatorShape extends Record<string, unknown> {
  id?: string | number;
  name?: string;
  title?: string;
}

export class Operator {
  declare readonly id?: string | number;
  declare readonly name?: string;
  declare readonly title?: string;

  constructor(shape: OperatorShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends Operator>(
    this: new (shape: OperatorShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    return new this(normalizeObject(json));
  }
}
