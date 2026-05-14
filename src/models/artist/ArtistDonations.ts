import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject, parseOptionalJsonObjectArray } from "../../core/parsing.ts";
import { ArtistDonationItem } from "./ArtistDonationItem.ts";

export interface ArtistDonationsShape extends Record<string, unknown> {
  items?: readonly ArtistDonationItem[];
}

export class ArtistDonations {
  declare readonly items?: readonly ArtistDonationItem[];

  constructor(shape: ArtistDonationsShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends ArtistDonations>(
    this: new (shape: ArtistDonationsShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeObject(json) as Record<string, JsonValue>;
    const shape: ArtistDonationsShape = { ...normalized };
    const items = parseOptionalJsonObjectArray(normalized.items, "$.items", (entry) =>
      ArtistDonationItem.fromJSON(entry));

    if (items !== undefined) shape.items = items;

    return new this(shape);
  }
}
