import type { DeepReadonly, JsonObject } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject } from "../../core/parsing.ts";

export interface MetatagSortByValueShape extends Record<string, unknown> {
  value?: string;
  title?: string;
}

export class MetatagSortByValue {
  declare readonly value?: string;
  declare readonly title?: string;

  constructor(shape: MetatagSortByValueShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends MetatagSortByValue>(
    this: new (shape: MetatagSortByValueShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    return new this(normalizeObject(json));
  }
}
