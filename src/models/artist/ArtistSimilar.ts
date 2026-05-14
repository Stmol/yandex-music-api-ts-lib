import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject, parseOptionalJsonObjectArray } from "../../core/parsing.ts";
import { Artist } from "./Artist.ts";

export interface ArtistSimilarShape extends Record<string, unknown> {
  artists?: readonly Artist[];
}

export class ArtistSimilar {
  declare readonly artists?: readonly Artist[];

  constructor(shape: ArtistSimilarShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends ArtistSimilar>(
    this: new (shape: ArtistSimilarShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeObject(json) as Record<string, JsonValue>;
    const shape: ArtistSimilarShape = { ...normalized };
    const artists = parseOptionalJsonObjectArray(normalized.artists, "$.artists", (entry) =>
      Artist.fromJSON(entry));

    if (artists !== undefined) shape.artists = artists;

    return new this(shape);
  }
}
