import type { DeepReadonly, JsonObject } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject } from "../../core/parsing.ts";

export interface ContentRestrictionsShape extends Record<string, unknown> {
  disclaimer?: string;
  restricted?: boolean;
  available?: boolean;
  reason?: string;
}

export class ContentRestrictions {
  declare readonly disclaimer?: string;
  declare readonly restricted?: boolean;
  declare readonly available?: boolean;
  declare readonly reason?: string;

  constructor(shape: ContentRestrictionsShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends ContentRestrictions>(
    this: new (shape: ContentRestrictionsShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    return new this(normalizeObject(json) as ContentRestrictionsShape);
  }
}
