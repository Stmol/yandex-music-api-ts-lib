import type { DeepReadonly, JsonObject } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject } from "../../core/parsing.ts";

export interface ArtistLinkShape extends Record<string, unknown> {
  title?: string;
  href?: string;
  type?: string;
  socialNetwork?: string;
}

export class ArtistLink {
  declare readonly title?: string;
  declare readonly href?: string;
  declare readonly type?: string;
  declare readonly socialNetwork?: string;

  constructor(shape: ArtistLinkShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends ArtistLink>(
    this: new (shape: ArtistLinkShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    return new this(normalizeObject(json) as ArtistLinkShape);
  }
}
