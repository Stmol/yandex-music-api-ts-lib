import type { DeepReadonly, JsonObject } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject } from "../../core/parsing.ts";

export interface CoverDerivedColorsShape extends Record<string, unknown> {
  average?: string;
  waveText?: string;
  miniPlayer?: string;
  accent?: string;
}

export class CoverDerivedColors {
  declare readonly average?: string;
  declare readonly waveText?: string;
  declare readonly miniPlayer?: string;
  declare readonly accent?: string;

  constructor(shape: CoverDerivedColorsShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends CoverDerivedColors>(
    this: new (shape: CoverDerivedColorsShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    return new this(normalizeObject(json));
  }
}
