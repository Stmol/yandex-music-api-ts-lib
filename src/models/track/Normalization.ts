import type { DeepReadonly, JsonObject } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject } from "../../core/parsing.ts";

export interface NormalizationShape extends Record<string, unknown> {
  gain?: number;
  peak?: number;
}

export class Normalization {
  declare readonly gain?: number;
  declare readonly peak?: number;

  constructor(shape: NormalizationShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends Normalization>(
    this: new (shape: NormalizationShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    return new this(normalizeObject(json) as NormalizationShape);
  }
}
