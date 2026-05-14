import type { DeepReadonly, JsonObject } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject } from "../../core/parsing.ts";

export interface MixLinkShape extends Record<string, unknown> {
  title?: string;
  url?: string;
}

export class MixLink {
  declare readonly title?: string;
  declare readonly url?: string;

  constructor(shape: MixLinkShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends MixLink>(
    this: new (shape: MixLinkShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    return new this(normalizeObject(json));
  }
}
