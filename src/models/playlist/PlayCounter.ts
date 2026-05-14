import type { DeepReadonly, JsonObject } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject } from "../../core/parsing.ts";

export interface PlayCounterShape extends Record<string, unknown> {
  value?: number;
  description?: string;
  updated?: string;
}

export class PlayCounter {
  declare readonly value?: number;
  declare readonly description?: string;
  declare readonly updated?: string;

  constructor(shape: PlayCounterShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends PlayCounter>(
    this: new (shape: PlayCounterShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    return new this(normalizeObject(json));
  }
}
