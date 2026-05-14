import type { DeepReadonly, JsonObject } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject } from "../../core/parsing.ts";

export interface LabelShape extends Record<string, unknown> {
  id?: string | number;
  title?: string;
}

export class Label {
  declare readonly id?: string | number;
  declare readonly title?: string;

  constructor(shape: LabelShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends Label>(
    this: new (shape: LabelShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    return new this(normalizeObject(json));
  }
}
