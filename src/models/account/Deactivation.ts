import type { DeepReadonly, JsonObject } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject } from "../../core/parsing.ts";

export interface DeactivationShape extends Record<string, unknown> {
  method?: string;
  instructions?: string;
  possible?: boolean;
}

export class Deactivation {
  declare readonly method?: string;
  declare readonly instructions?: string;
  declare readonly possible?: boolean;

  constructor(shape: DeactivationShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends Deactivation>(
    this: new (shape: DeactivationShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    return new this(normalizeObject(json));
  }
}
