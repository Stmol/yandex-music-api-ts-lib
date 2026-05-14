import type { DeepReadonly, JsonObject } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject } from "../../core/parsing.ts";

export interface ClipShape extends Record<string, unknown> {
  id?: string | number;
  title?: string;
}

export class Clip {
  declare readonly id?: string | number;
  declare readonly title?: string;

  constructor(shape: ClipShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends Clip>(
    this: new (shape: ClipShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    return new this(normalizeObject(json));
  }
}
