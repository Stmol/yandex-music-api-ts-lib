import type { DeepReadonly, JsonObject } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject } from "../../core/parsing.ts";

export interface ContestShape extends Record<string, unknown> {
  contestId?: string | number;
  title?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export class Contest {
  declare readonly contestId?: string | number;
  declare readonly title?: string;
  declare readonly status?: string;
  declare readonly startDate?: string;
  declare readonly endDate?: string;

  constructor(shape: ContestShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends Contest>(
    this: new (shape: ContestShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    return new this(normalizeObject(json));
  }
}
