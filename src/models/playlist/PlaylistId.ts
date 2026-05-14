import type { DeepReadonly, JsonObject } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject } from "../../core/parsing.ts";

export interface PlaylistIdShape extends Record<string, unknown> {
  uid?: number | string;
  kind?: number | string;
}

export class PlaylistId {
  declare readonly uid?: number | string;
  declare readonly kind?: number | string;

  constructor(shape: PlaylistIdShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends PlaylistId>(
    this: new (shape: PlaylistIdShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    return new this(normalizeObject(json));
  }
}
