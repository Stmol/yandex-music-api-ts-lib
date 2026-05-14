import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject, parseOptionalJsonObjectArray } from "../../core/parsing.ts";
import { ArtistLink } from "./ArtistLink.ts";

export interface ArtistLinksShape extends Record<string, unknown> {
  links?: readonly ArtistLink[];
}

export class ArtistLinks {
  declare readonly links?: readonly ArtistLink[];

  constructor(shape: ArtistLinksShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends ArtistLinks>(
    this: new (shape: ArtistLinksShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeObject(json) as Record<string, JsonValue>;
    const shape: ArtistLinksShape = { ...normalized };
    const links = parseOptionalJsonObjectArray(normalized.links, "$.links", (entry) =>
      ArtistLink.fromJSON(entry));

    if (links !== undefined) shape.links = links;

    return new this(shape);
  }
}
