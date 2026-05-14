import type { DeepReadonly, JsonObject } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject } from "../../core/parsing.ts";

export interface StatsShape extends Record<string, unknown> {
  lastMonthListeners?: number;
  lastMonthTracks?: number;
}

export class Stats {
  declare readonly lastMonthListeners?: number;
  declare readonly lastMonthTracks?: number;

  constructor(shape: StatsShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends Stats>(
    this: new (shape: StatsShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    return new this(normalizeObject(json));
  }
}
