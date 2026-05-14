import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject, parseOptionalJsonObject, parseOptionalJsonObjectArray } from "../../core/parsing.ts";
import { Album } from "../album/Album.ts";
import { Track } from "../track/Track.ts";
import { Artist } from "./Artist.ts";

export interface ArtistInfoShape extends Record<string, unknown> {
  artist?: Artist | null;
  albums?: readonly Album[];
  tracks?: readonly Track[];
}

export class ArtistInfo {
  declare readonly artist?: Artist | null;
  declare readonly albums?: readonly Album[];
  declare readonly tracks?: readonly Track[];

  constructor(shape: ArtistInfoShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends ArtistInfo>(
    this: new (shape: ArtistInfoShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeObject(json) as Record<string, JsonValue>;
    const shape: ArtistInfoShape = { ...normalized };
    const artist = parseOptionalJsonObject(normalized.artist, "$.artist", (entry) =>
      Artist.fromJSON(entry));
    const albums = parseOptionalJsonObjectArray(normalized.albums, "$.albums", (entry) =>
      Album.fromJSON(entry));
    const tracks = parseOptionalJsonObjectArray(normalized.tracks, "$.tracks", (entry) =>
      Track.fromJSON(entry));

    if (artist !== undefined) shape.artist = artist;
    if (albums !== undefined) shape.albums = albums;
    if (tracks !== undefined) shape.tracks = tracks;

    return new this(shape);
  }
}
