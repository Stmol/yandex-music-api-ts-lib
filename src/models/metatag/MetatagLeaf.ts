import type { DeepReadonly, JsonObject } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject } from "../../core/parsing.ts";

export interface MetatagLeafShape extends Record<string, unknown> {
  id?: string | number;
  title?: string;
}

export class MetatagLeaf {
  declare readonly id?: string | number;
  declare readonly title?: string;

  constructor(shape: MetatagLeafShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends MetatagLeaf>(
    this: new (shape: MetatagLeafShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    return new this(normalizeObject(json));
  }
}
