import type { DeepReadonly, JsonObject } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject } from "../../core/parsing.ts";

export interface PoetryLoverMatchShape extends Record<string, unknown> {
  begin?: number;
  end?: number;
  line?: string;
}

export class PoetryLoverMatch {
  declare readonly begin?: number;
  declare readonly end?: number;
  declare readonly line?: string;

  constructor(shape: PoetryLoverMatchShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends PoetryLoverMatch>(
    this: new (shape: PoetryLoverMatchShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    return new this(normalizeObject(json));
  }
}
