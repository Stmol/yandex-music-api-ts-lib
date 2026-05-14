import type { DeepReadonly, JsonObject } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject } from "../../core/parsing.ts";

export interface MajorShape extends Record<string, unknown> {
  id?: number | string;
  name?: string;
}

export class Major {
  declare readonly id?: number | string;
  declare readonly name?: string;

  constructor(shape: MajorShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends Major>(
    this: new (shape: MajorShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    return new this(normalizeObject(json) as MajorShape);
  }
}
