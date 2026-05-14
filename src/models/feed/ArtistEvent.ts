import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject, parseOptionalJsonObject } from "../../core/parsing.ts";
import { Artist } from "../artist/Artist.ts";

export interface ArtistEventShape extends Record<string, unknown> {
  artist?: Artist | null;
}

export class ArtistEvent {
  declare readonly artist?: Artist | null;

  constructor(shape: ArtistEventShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends ArtistEvent>(
    this: new (shape: ArtistEventShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeObject(json) as Record<string, JsonValue>;
    const shape: ArtistEventShape = { ...normalized };
    const artist = parseOptionalJsonObject(normalized.artist, "$.artist", (entry) =>
      Artist.fromJSON(entry));

    if (artist !== undefined) shape.artist = artist;

    return new this(shape);
  }
}
