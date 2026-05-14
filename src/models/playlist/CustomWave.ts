import type { DeepReadonly, JsonObject } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject } from "../../core/parsing.ts";

export interface CustomWaveShape extends Record<string, unknown> {
  title?: string;
  animationUrl?: string;
  header?: string;
  subheader?: string;
}

export class CustomWave {
  declare readonly title?: string;
  declare readonly animationUrl?: string;
  declare readonly header?: string;
  declare readonly subheader?: string;

  constructor(shape: CustomWaveShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends CustomWave>(
    this: new (shape: CustomWaveShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    return new this(normalizeObject(json));
  }
}
