import type { DeepReadonly, JsonObject } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject } from "../../core/parsing.ts";

export interface MetatagShape extends Record<string, unknown> {
  id?: string | number;
  title?: string;
}

export class Metatag {
  declare readonly id?: string | number;
  declare readonly title?: string;

  constructor(shape: MetatagShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends Metatag>(
    this: new (shape: MetatagShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    return new this(normalizeObject(json));
  }
}
