import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject, parseOptionalJsonObjectArray } from "../../core/parsing.ts";
import { Artist } from "../artist/Artist.ts";
import { MetatagArtistEntry } from "./MetatagArtistEntry.ts";

export interface MetatagArtistsShape extends Record<string, unknown> {
  artists?: readonly (Artist | MetatagArtistEntry)[];
}

export class MetatagArtists {
  declare readonly artists?: readonly (Artist | MetatagArtistEntry)[];

  constructor(shape: MetatagArtistsShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends MetatagArtists>(
    this: new (shape: MetatagArtistsShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeObject(json) as Record<string, JsonValue>;
    const shape: MetatagArtistsShape = { ...normalized };
    const artists = parseOptionalJsonObjectArray(normalized.artists, "$.artists", (entry) =>
      "artist" in entry ? MetatagArtistEntry.fromJSON(entry) : Artist.fromJSON(entry));

    if (artists !== undefined) shape.artists = artists;

    return new this(shape);
  }
}
