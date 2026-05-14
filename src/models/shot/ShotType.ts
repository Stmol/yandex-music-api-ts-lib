import type { DeepReadonly, JsonObject } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject } from "../../core/parsing.ts";

export interface ShotTypeShape extends Record<string, unknown> {
  type?: string;
  title?: string;
}

export class ShotType {
  declare readonly type?: string;
  declare readonly title?: string;

  constructor(shape: ShotTypeShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends ShotType>(
    this: new (shape: ShotTypeShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    return new this(normalizeObject(json));
  }
}
