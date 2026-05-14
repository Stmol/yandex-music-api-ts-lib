import type { DeepReadonly, JsonObject } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject } from "../../core/parsing.ts";

export interface TrackIdShape extends Record<string, unknown> {
  id?: string | number;
  albumId?: string | number;
  trackId?: string | number;
}

export class TrackId {
  declare readonly id?: string | number;
  declare readonly albumId?: string | number;
  declare readonly trackId?: string | number;

  constructor(shape: TrackIdShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends TrackId>(
    this: new (shape: TrackIdShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    return new this(normalizeObject(json));
  }
}
