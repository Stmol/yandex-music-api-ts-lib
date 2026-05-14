import type { DeepReadonly, JsonObject } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject } from "../../core/parsing.ts";

export interface TrackLyricsShape extends Record<string, unknown> {
  id?: string | number;
  lyrics?: string;
  fullLyrics?: string;
  textLanguage?: string;
  showTranslation?: boolean;
  hasRights?: boolean;
}

export class TrackLyrics {
  declare readonly id?: string | number;
  declare readonly lyrics?: string;
  declare readonly fullLyrics?: string;
  declare readonly textLanguage?: string;
  declare readonly showTranslation?: boolean;
  declare readonly hasRights?: boolean;

  constructor(shape: TrackLyricsShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends TrackLyrics>(
    this: new (shape: TrackLyricsShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    return new this(normalizeObject(json));
  }
}
