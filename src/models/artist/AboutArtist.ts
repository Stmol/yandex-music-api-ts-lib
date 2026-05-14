import type { DeepReadonly, JsonObject } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject } from "../../core/parsing.ts";

export interface AboutArtistShape extends Record<string, unknown> {
  text?: string;
  uri?: string;
}

export class AboutArtist {
  declare readonly text?: string;
  declare readonly uri?: string;

  constructor(shape: AboutArtistShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends AboutArtist>(
    this: new (shape: AboutArtistShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    return new this(normalizeObject(json));
  }
}
