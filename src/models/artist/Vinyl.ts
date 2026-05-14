import type { DeepReadonly, JsonObject } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject } from "../../core/parsing.ts";

export interface VinylShape extends Record<string, unknown> {
  title?: string;
  url?: string;
  price?: string | number;
}

export class Vinyl {
  declare readonly title?: string;
  declare readonly url?: string;
  declare readonly price?: string | number;

  constructor(shape: VinylShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends Vinyl>(
    this: new (shape: VinylShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    return new this(normalizeObject(json));
  }
}
