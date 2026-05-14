import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject, parseOptionalJsonObjectArray } from "../../core/parsing.ts";
import { Album } from "../album/Album.ts";
import { Artist } from "../artist/Artist.ts";
import { Playlist } from "../playlist/Playlist.ts";
import { Track } from "../track/Track.ts";

export interface LandingListShape extends Record<string, unknown> {
  title?: string;
  type?: string;
  albums?: readonly Album[];
  playlists?: readonly Playlist[];
  tracks?: readonly Track[];
  artists?: readonly Artist[];
}

export class LandingList {
  declare readonly title?: string;
  declare readonly type?: string;
  declare readonly albums?: readonly Album[];
  declare readonly playlists?: readonly Playlist[];
  declare readonly tracks?: readonly Track[];
  declare readonly artists?: readonly Artist[];

  constructor(shape: LandingListShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends LandingList>(
    this: new (shape: LandingListShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeObject(json) as Record<string, JsonValue>;
    const shape: LandingListShape = { ...normalized };
    const albums = parseOptionalJsonObjectArray(normalized.albums, "$.albums", (entry) =>
      Album.fromJSON(entry));
    const playlists = parseOptionalJsonObjectArray(normalized.playlists, "$.playlists", (entry) =>
      Playlist.fromJSON(entry));
    const tracks = parseOptionalJsonObjectArray(normalized.tracks, "$.tracks", (entry) =>
      Track.fromJSON(entry));
    const artists = parseOptionalJsonObjectArray(normalized.artists, "$.artists", (entry) =>
      Artist.fromJSON(entry));

    if (albums !== undefined) shape.albums = albums;
    if (playlists !== undefined) shape.playlists = playlists;
    if (tracks !== undefined) shape.tracks = tracks;
    if (artists !== undefined) shape.artists = artists;

    return new this(shape);
  }
}
