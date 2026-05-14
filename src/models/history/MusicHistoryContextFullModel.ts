import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject, parseOptionalJsonObject } from "../../core/parsing.ts";
import { Album } from "../album/Album.ts";
import { Artist } from "../artist/Artist.ts";
import { Playlist } from "../playlist/Playlist.ts";
import { Track } from "../track/Track.ts";

export interface MusicHistoryContextFullModelShape extends Record<string, unknown> {
  album?: Album | null;
  artist?: Artist | null;
  playlist?: Playlist | null;
  track?: Track | null;
}

export class MusicHistoryContextFullModel {
  declare readonly album?: Album | null;
  declare readonly artist?: Artist | null;
  declare readonly playlist?: Playlist | null;
  declare readonly track?: Track | null;

  constructor(shape: MusicHistoryContextFullModelShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends MusicHistoryContextFullModel>(
    this: new (shape: MusicHistoryContextFullModelShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeObject(json) as Record<string, JsonValue>;
    const shape: MusicHistoryContextFullModelShape = { ...normalized };
    const album = parseOptionalJsonObject(normalized.album, "$.album", (entry) =>
      Album.fromJSON(entry));
    const artist = parseOptionalJsonObject(normalized.artist, "$.artist", (entry) =>
      Artist.fromJSON(entry));
    const playlist = parseOptionalJsonObject(normalized.playlist, "$.playlist", (entry) =>
      Playlist.fromJSON(entry));
    const track = parseOptionalJsonObject(normalized.track, "$.track", (entry) =>
      Track.fromJSON(entry));

    if (album !== undefined) shape.album = album;
    if (artist !== undefined) shape.artist = artist;
    if (playlist !== undefined) shape.playlist = playlist;
    if (track !== undefined) shape.track = track;

    return new this(shape);
  }
}
