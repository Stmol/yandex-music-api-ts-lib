import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject, parseOptionalJsonObjectArray } from "../../core/parsing.ts";
import { Artist } from "../artist/Artist.ts";
import { Track } from "../track/Track.ts";
import { Album } from "./Album.ts";

export interface AlbumSimilarEntitiesShape extends Record<string, unknown> {
  albums?: readonly Album[];
  artists?: readonly Artist[];
  tracks?: readonly Track[];
}

export class AlbumSimilarEntities {
  declare readonly albums?: readonly Album[];
  declare readonly artists?: readonly Artist[];
  declare readonly tracks?: readonly Track[];

  constructor(shape: AlbumSimilarEntitiesShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends AlbumSimilarEntities>(
    this: new (shape: AlbumSimilarEntitiesShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeObject(json) as Record<string, JsonValue>;
    const shape: AlbumSimilarEntitiesShape = { ...normalized };
    const albums = parseOptionalJsonObjectArray(normalized.albums, "$.albums", (entry) =>
      Album.fromJSON(entry));
    const artists = parseOptionalJsonObjectArray(normalized.artists, "$.artists", (entry) =>
      Artist.fromJSON(entry));
    const tracks = parseOptionalJsonObjectArray(normalized.tracks, "$.tracks", (entry) =>
      Track.fromJSON(entry));

    if (albums !== undefined) shape.albums = albums;
    if (artists !== undefined) shape.artists = artists;
    if (tracks !== undefined) shape.tracks = tracks;

    return new this(shape);
  }
}
