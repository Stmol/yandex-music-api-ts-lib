import type { DeepReadonly, JsonObject } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject } from "../../core/parsing.ts";

export interface DescriptionShape extends Record<string, unknown> {
  text?: string;
  uri?: string;
}

export class Description {
  declare readonly text?: string;
  declare readonly uri?: string;

  constructor(shape: DescriptionShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends Description>(
    this: new (shape: DescriptionShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    return new this(normalizeObject(json) as DescriptionShape);
  }
}
