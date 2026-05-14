import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject, parseOptionalJsonObject, parseOptionalJsonObjectArray } from "../../core/parsing.ts";
import { Pager } from "../shared/Pager.ts";
import { Playlist } from "./Playlist.ts";

export interface PlaylistsListShape extends Record<string, unknown> {
  playlists?: readonly Playlist[];
  pager?: Pager | null;
}

export class PlaylistsList {
  declare readonly playlists?: readonly Playlist[];
  declare readonly pager?: Pager | null;

  constructor(shape: PlaylistsListShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends PlaylistsList>(
    this: new (shape: PlaylistsListShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeObject(json) as Record<string, JsonValue>;
    const shape: PlaylistsListShape = { ...normalized };
    const playlists = parseOptionalJsonObjectArray(normalized.playlists, "$.playlists", (entry) =>
      Playlist.fromJSON(entry));
    const pager = parseOptionalJsonObject(normalized.pager, "$.pager", (entry) =>
      Pager.fromJSON(entry));

    if (playlists !== undefined) shape.playlists = playlists;
    if (pager !== undefined) shape.pager = pager;

    return new this(shape);
  }
}
