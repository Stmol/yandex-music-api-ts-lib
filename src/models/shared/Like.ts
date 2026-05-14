import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject, parseOptionalJsonObject } from "../../core/parsing.ts";
import { Album } from "../album/Album.ts";
import { Artist } from "../artist/Artist.ts";
import { Playlist } from "../playlist/Playlist.ts";

export type LikeType = "album" | "artist" | "playlist";

export interface LikeShape extends Record<string, unknown> {
  type?: LikeType;
  id?: string;
  timestamp?: string;
  albumId?: string | number;
  trackId?: string | number;
  playlistId?: string | number;
  artistId?: string | number;
  album?: Album | null;
  artist?: Artist | null;
  playlist?: Playlist | null;
  shortDescription?: string;
  description?: string;
  isPremiere?: boolean;
  isBanner?: boolean;
}

export class Like {
  declare readonly type?: LikeType;
  declare readonly id?: string;
  declare readonly timestamp?: string;
  declare readonly albumId?: string | number;
  declare readonly trackId?: string | number;
  declare readonly playlistId?: string | number;
  declare readonly artistId?: string | number;
  declare readonly album?: Album | null;
  declare readonly artist?: Artist | null;
  declare readonly playlist?: Playlist | null;
  declare readonly shortDescription?: string;
  declare readonly description?: string;
  declare readonly isPremiere?: boolean;
  declare readonly isBanner?: boolean;

  constructor(shape: LikeShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends Like>(
    this: new (shape: LikeShape) => TModel,
    json: DeepReadonly<JsonObject>,
    type?: LikeType,
  ): TModel {
    const normalized = normalizeObject(json) as Record<string, JsonValue>;
    const shape: LikeShape = { ...normalized };
    const album = parseOptionalJsonObject(normalized.album, "$.album", (entry) =>
      Album.fromJSON(entry));
    const playlist = parseOptionalJsonObject(normalized.playlist, "$.playlist", (entry) =>
      Playlist.fromJSON(entry));
    const artist = normalized.artist === undefined && type === "artist"
      ? Artist.fromJSON(json)
      : parseOptionalJsonObject(normalized.artist, "$.artist", (entry) =>
        Artist.fromJSON(entry));

    if (type !== undefined) shape.type = type;
    if (album !== undefined) shape.album = album;
    if (artist !== undefined) shape.artist = artist;
    if (playlist !== undefined) shape.playlist = playlist;

    return new this(shape);
  }
}
