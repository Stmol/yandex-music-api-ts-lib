import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject, parseOptionalJsonObject } from "../../core/parsing.ts";
import { ArtistDonationData } from "./ArtistDonationData.ts";

export interface ArtistDonationItemShape extends Record<string, unknown> {
  type?: string;
  data?: ArtistDonationData | null;
}

export class ArtistDonationItem {
  declare readonly type?: string;
  declare readonly data?: ArtistDonationData | null;

  constructor(shape: ArtistDonationItemShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends ArtistDonationItem>(
    this: new (shape: ArtistDonationItemShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeObject(json) as Record<string, JsonValue>;
    const shape: ArtistDonationItemShape = { ...normalized };
    const data = parseOptionalJsonObject(normalized.data, "$.data", (entry) =>
      ArtistDonationData.fromJSON(entry));

    if (data !== undefined) shape.data = data;

    return new this(shape);
  }
}
