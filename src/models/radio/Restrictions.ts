import type { DeepReadonly, JsonObject } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject } from "../../core/parsing.ts";

export interface RestrictionsShape extends Record<string, unknown> {
  language?: string;
  diversity?: string;
  mood?: string;
  energy?: string;
}

export class Restrictions {
  declare readonly language?: string;
  declare readonly diversity?: string;
  declare readonly mood?: string;
  declare readonly energy?: string;

  constructor(shape: RestrictionsShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends Restrictions>(
    this: new (shape: RestrictionsShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    return new this(normalizeObject(json));
  }
}
