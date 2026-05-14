import type { DeepReadonly, JsonObject } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject } from "../../core/parsing.ts";

export interface LyricsInfoShape extends Record<string, unknown> {
  hasAvailableSyncLyrics?: boolean;
  hasAvailableTextLyrics?: boolean;
}

export class LyricsInfo {
  declare readonly hasAvailableSyncLyrics?: boolean;
  declare readonly hasAvailableTextLyrics?: boolean;

  constructor(shape: LyricsInfoShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends LyricsInfo>(
    this: new (shape: LyricsInfoShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    return new this(normalizeObject(json) as LyricsInfoShape);
  }
}
