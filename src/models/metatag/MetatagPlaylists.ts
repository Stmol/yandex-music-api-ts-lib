import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject, parseOptionalJsonObjectArray } from "../../core/parsing.ts";
import { Playlist } from "../playlist/Playlist.ts";

export interface MetatagPlaylistsShape extends Record<string, unknown> {
  playlists?: readonly Playlist[];
}

export class MetatagPlaylists {
  declare readonly playlists?: readonly Playlist[];

  constructor(shape: MetatagPlaylistsShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends MetatagPlaylists>(
    this: new (shape: MetatagPlaylistsShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeObject(json) as Record<string, JsonValue>;
    const shape: MetatagPlaylistsShape = { ...normalized };
    const playlists = parseOptionalJsonObjectArray(normalized.playlists, "$.playlists", (entry) =>
      Playlist.fromJSON(entry));

    if (playlists !== undefined) shape.playlists = playlists;

    return new this(shape);
  }
}
