import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject, parseOptionalJsonObjectArray } from "../../core/parsing.ts";
import { Album } from "../album/Album.ts";

export interface MetatagAlbumsShape extends Record<string, unknown> {
  albums?: readonly Album[];
}

export class MetatagAlbums {
  declare readonly albums?: readonly Album[];

  constructor(shape: MetatagAlbumsShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends MetatagAlbums>(
    this: new (shape: MetatagAlbumsShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeObject(json) as Record<string, JsonValue>;
    const shape: MetatagAlbumsShape = { ...normalized };
    const albums = parseOptionalJsonObjectArray(normalized.albums, "$.albums", (entry) =>
      Album.fromJSON(entry));

    if (albums !== undefined) shape.albums = albums;

    return new this(shape);
  }
}
