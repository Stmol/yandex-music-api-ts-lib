import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject, parseOptionalJsonObjectArray } from "../../core/parsing.ts";
import { Album } from "../album/Album.ts";
import { Artist } from "../artist/Artist.ts";
import { Track } from "../track/Track.ts";
import { Playlist } from "./Playlist.ts";

export interface PlaylistSimilarEntitiesShape extends Record<string, unknown> {
  playlists?: readonly Playlist[];
  albums?: readonly Album[];
  artists?: readonly Artist[];
  tracks?: readonly Track[];
}

export class PlaylistSimilarEntities {
  declare readonly playlists?: readonly Playlist[];
  declare readonly albums?: readonly Album[];
  declare readonly artists?: readonly Artist[];
  declare readonly tracks?: readonly Track[];

  constructor(shape: PlaylistSimilarEntitiesShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends PlaylistSimilarEntities>(
    this: new (shape: PlaylistSimilarEntitiesShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeObject(json) as Record<string, JsonValue>;
    const shape: PlaylistSimilarEntitiesShape = { ...normalized };
    const playlists = parseOptionalJsonObjectArray(normalized.playlists, "$.playlists", (entry) =>
      Playlist.fromJSON(entry));
    const albums = parseOptionalJsonObjectArray(normalized.albums, "$.albums", (entry) =>
      Album.fromJSON(entry));
    const artists = parseOptionalJsonObjectArray(normalized.artists, "$.artists", (entry) =>
      Artist.fromJSON(entry));
    const tracks = parseOptionalJsonObjectArray(normalized.tracks, "$.tracks", (entry) =>
      Track.fromJSON(entry));

    if (playlists !== undefined) shape.playlists = playlists;
    if (albums !== undefined) shape.albums = albums;
    if (artists !== undefined) shape.artists = artists;
    if (tracks !== undefined) shape.tracks = tracks;

    return new this(shape);
  }
}
