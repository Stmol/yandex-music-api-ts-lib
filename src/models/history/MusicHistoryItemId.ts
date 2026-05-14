import type { DeepReadonly, JsonObject } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject } from "../../core/parsing.ts";

export interface MusicHistoryItemIdShape extends Record<string, unknown> {
  id?: string | number;
  trackId?: string | number;
  albumId?: string | number;
  uid?: string | number;
  kind?: string | number;
}

export class MusicHistoryItemId {
  declare readonly id?: string | number;
  declare readonly trackId?: string | number;
  declare readonly albumId?: string | number;
  declare readonly uid?: string | number;
  declare readonly kind?: string | number;

  constructor(shape: MusicHistoryItemIdShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends MusicHistoryItemId>(
    this: new (shape: MusicHistoryItemIdShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    return new this(normalizeObject(json));
  }
}
