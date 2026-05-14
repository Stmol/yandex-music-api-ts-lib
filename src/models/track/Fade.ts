import type { DeepReadonly, JsonObject } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject } from "../../core/parsing.ts";

export interface FadeShape extends Record<string, unknown> {
  inStart?: number;
  inStop?: number;
  outStart?: number;
  outStop?: number;
}

export class Fade {
  declare readonly inStart?: number;
  declare readonly inStop?: number;
  declare readonly outStart?: number;
  declare readonly outStop?: number;

  constructor(shape: FadeShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends Fade>(
    this: new (shape: FadeShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    return new this(normalizeObject(json));
  }
}
