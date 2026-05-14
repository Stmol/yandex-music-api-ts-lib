import type { DeepReadonly, JsonObject } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject } from "../../core/parsing.ts";

export interface TagShape extends Record<string, unknown> {
  id?: string;
  value?: string;
  name?: string;
  ogDescription?: string;
}

export class Tag {
  declare readonly id?: string;
  declare readonly value?: string;
  declare readonly name?: string;
  declare readonly ogDescription?: string;

  constructor(shape: TagShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends Tag>(
    this: new (shape: TagShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    return new this(normalizeObject(json));
  }
}
