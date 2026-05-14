import type { DeepReadonly, JsonObject } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject } from "../../core/parsing.ts";

export interface LinkShape extends Record<string, unknown> {
  title?: string;
  href?: string;
  type?: string;
}

export class Link {
  declare readonly title?: string;
  declare readonly href?: string;
  declare readonly type?: string;

  constructor(shape: LinkShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends Link>(
    this: new (shape: LinkShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    return new this(normalizeObject(json));
  }
}
