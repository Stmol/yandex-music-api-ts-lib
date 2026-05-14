import type { DeepReadonly, JsonObject } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject } from "../../core/parsing.ts";

export interface LikeShape extends Record<string, unknown> {
  timestamp?: string;
  albumId?: string | number;
  trackId?: string | number;
  playlistId?: string | number;
  artistId?: string | number;
}

export class Like {
  declare readonly timestamp?: string;
  declare readonly albumId?: string | number;
  declare readonly trackId?: string | number;
  declare readonly playlistId?: string | number;
  declare readonly artistId?: string | number;

  constructor(shape: LikeShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends Like>(
    this: new (shape: LikeShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    return new this(normalizeObject(json));
  }
}
