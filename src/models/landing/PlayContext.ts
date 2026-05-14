import type { DeepReadonly, JsonObject } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject } from "../../core/parsing.ts";

export interface PlayContextShape extends Record<string, unknown> {
  title?: string;
  type?: string;
  uri?: string;
}

export class PlayContext {
  declare readonly title?: string;
  declare readonly type?: string;
  declare readonly uri?: string;

  constructor(shape: PlayContextShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends PlayContext>(
    this: new (shape: PlayContextShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    return new this(normalizeObject(json));
  }
}
