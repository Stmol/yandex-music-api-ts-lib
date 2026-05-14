import type { DeepReadonly, JsonObject } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject } from "../../core/parsing.ts";

export interface UserSettingsShape extends Record<string, unknown> {
  uid?: number | string;
  lastFmScrobblingEnabled?: boolean;
  shuffleEnabled?: boolean;
  addNewTrackOnPlaylistTop?: boolean;
  volumePercents?: number;
}

export class UserSettings {
  declare readonly uid?: number | string;
  declare readonly lastFmScrobblingEnabled?: boolean;
  declare readonly shuffleEnabled?: boolean;
  declare readonly addNewTrackOnPlaylistTop?: boolean;
  declare readonly volumePercents?: number;

  constructor(shape: UserSettingsShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends UserSettings>(
    this: new (shape: UserSettingsShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    return new this(normalizeObject(json));
  }
}
