import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject, parseOptionalJsonObjectArray } from "../../core/parsing.ts";
import { Artist } from "../artist/Artist.ts";

export interface LabelArtistsShape extends Record<string, unknown> {
  artists?: readonly Artist[];
}

export class LabelArtists {
  declare readonly artists?: readonly Artist[];

  constructor(shape: LabelArtistsShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends LabelArtists>(
    this: new (shape: LabelArtistsShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeObject(json) as Record<string, JsonValue>;
    const shape: LabelArtistsShape = { ...normalized };
    const artists = parseOptionalJsonObjectArray(normalized.artists, "$.artists", (entry) =>
      Artist.fromJSON(entry));

    if (artists !== undefined) shape.artists = artists;

    return new this(shape);
  }
}
