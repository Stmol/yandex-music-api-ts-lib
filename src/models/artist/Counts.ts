import type { DeepReadonly, JsonObject } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject } from "../../core/parsing.ts";

export interface CountsShape extends Record<string, unknown> {
  albums?: number;
  tracks?: number;
  alsoAlbums?: number;
}

export class Counts {
  declare readonly albums?: number;
  declare readonly tracks?: number;
  declare readonly alsoAlbums?: number;

  constructor(shape: CountsShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends Counts>(
    this: new (shape: CountsShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    return new this(normalizeObject(json));
  }
}
