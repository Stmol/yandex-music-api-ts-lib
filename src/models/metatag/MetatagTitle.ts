import type { DeepReadonly, JsonObject } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject } from "../../core/parsing.ts";

export interface MetatagTitleShape extends Record<string, unknown> {
  title?: string;
  fullTitle?: string;
}

export class MetatagTitle {
  declare readonly title?: string;
  declare readonly fullTitle?: string;

  constructor(shape: MetatagTitleShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends MetatagTitle>(
    this: new (shape: MetatagTitleShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    return new this(normalizeObject(json));
  }
}
