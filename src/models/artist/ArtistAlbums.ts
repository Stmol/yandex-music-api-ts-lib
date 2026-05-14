import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject, parseOptionalJsonObjectArray } from "../../core/parsing.ts";
import { Album } from "../album/Album.ts";

export interface ArtistAlbumsShape extends Record<string, unknown> {
  albums?: readonly Album[];
}

export class ArtistAlbums {
  declare readonly albums?: readonly Album[];

  constructor(shape: ArtistAlbumsShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends ArtistAlbums>(
    this: new (shape: ArtistAlbumsShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeObject(json) as Record<string, JsonValue>;
    const shape: ArtistAlbumsShape = { ...normalized };
    const albums = parseOptionalJsonObjectArray(normalized.albums, "$.albums", (entry) =>
      Album.fromJSON(entry));

    if (albums !== undefined) shape.albums = albums;

    return new this(shape);
  }
}
