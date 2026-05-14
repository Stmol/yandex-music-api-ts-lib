import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject, parseOptionalJsonObjectArray } from "../../core/parsing.ts";
import { Playlist } from "../playlist/Playlist.ts";

export interface PersonalPlaylistsDataShape extends Record<string, unknown> {
  items?: readonly Playlist[];
  playlists?: readonly Playlist[];
}

export class PersonalPlaylistsData {
  declare readonly items?: readonly Playlist[];
  declare readonly playlists?: readonly Playlist[];

  constructor(shape: PersonalPlaylistsDataShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends PersonalPlaylistsData>(
    this: new (shape: PersonalPlaylistsDataShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeObject(json) as Record<string, JsonValue>;
    const shape: PersonalPlaylistsDataShape = { ...normalized };
    const items = parseOptionalJsonObjectArray(normalized.items, "$.items", (entry) =>
      Playlist.fromJSON(entry));
    const playlists = parseOptionalJsonObjectArray(normalized.playlists, "$.playlists", (entry) =>
      Playlist.fromJSON(entry));

    if (items !== undefined) shape.items = items;
    if (playlists !== undefined) shape.playlists = playlists;

    return new this(shape);
  }
}
