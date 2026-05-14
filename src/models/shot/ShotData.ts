import type { DeepReadonly, JsonObject } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject } from "../../core/parsing.ts";

export interface ShotDataShape extends Record<string, unknown> {
  id?: string | number;
  title?: string;
}

export class ShotData {
  declare readonly id?: string | number;
  declare readonly title?: string;

  constructor(shape: ShotDataShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends ShotData>(
    this: new (shape: ShotDataShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    return new this(normalizeObject(json));
  }
}
