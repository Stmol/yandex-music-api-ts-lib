import type { DeepReadonly, JsonObject } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject } from "../../core/parsing.ts";

export interface ChartInfoShape extends Record<string, unknown> {
  position?: number;
  progress?: string;
  listeners?: number;
  shift?: number;
}

export class ChartInfo {
  declare readonly position?: number;
  declare readonly progress?: string;
  declare readonly listeners?: number;
  declare readonly shift?: number;

  constructor(shape: ChartInfoShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends ChartInfo>(
    this: new (shape: ChartInfoShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    return new this(normalizeObject(json) as ChartInfoShape);
  }
}
