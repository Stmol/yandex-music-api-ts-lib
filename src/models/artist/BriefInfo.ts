import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject, parseOptionalJsonObject, parseOptionalJsonObjectArray } from "../../core/parsing.ts";
import { Album } from "../album/Album.ts";
import { Track } from "../track/Track.ts";
import { Artist } from "./Artist.ts";

export interface BriefInfoShape extends Record<string, unknown> {
  artist?: Artist | null;
  albums?: readonly Album[];
  alsoAlbums?: readonly Album[];
  popularTracks?: readonly Track[];
}

export class BriefInfo {
  declare readonly artist?: Artist | null;
  declare readonly albums?: readonly Album[];
  declare readonly alsoAlbums?: readonly Album[];
  declare readonly popularTracks?: readonly Track[];

  constructor(shape: BriefInfoShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends BriefInfo>(
    this: new (shape: BriefInfoShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeObject(json) as Record<string, JsonValue>;
    const shape: BriefInfoShape = { ...normalized };
    const artist = parseOptionalJsonObject(normalized.artist, "$.artist", (entry) =>
      Artist.fromJSON(entry));
    const albums = parseOptionalJsonObjectArray(normalized.albums, "$.albums", (entry) =>
      Album.fromJSON(entry));
    const alsoAlbums = parseOptionalJsonObjectArray(normalized.alsoAlbums, "$.alsoAlbums", (entry) =>
      Album.fromJSON(entry));
    const popularTracks = parseOptionalJsonObjectArray(normalized.popularTracks, "$.popularTracks", (entry) =>
      Track.fromJSON(entry));

    if (artist !== undefined) shape.artist = artist;
    if (albums !== undefined) shape.albums = albums;
    if (alsoAlbums !== undefined) shape.alsoAlbums = alsoAlbums;
    if (popularTracks !== undefined) shape.popularTracks = popularTracks;

    return new this(shape);
  }
}
