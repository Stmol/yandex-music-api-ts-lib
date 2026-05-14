import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject, parseOptionalJsonObject } from "../../core/parsing.ts";
import { ArtistDonationGoal } from "./ArtistDonationGoal.ts";

export interface ArtistDonationDataShape extends Record<string, unknown> {
  goal?: ArtistDonationGoal | null;
  donationGoal?: ArtistDonationGoal | null;
}

export class ArtistDonationData {
  declare readonly goal?: ArtistDonationGoal | null;
  declare readonly donationGoal?: ArtistDonationGoal | null;

  constructor(shape: ArtistDonationDataShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends ArtistDonationData>(
    this: new (shape: ArtistDonationDataShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeObject(json) as Record<string, JsonValue>;
    const shape: ArtistDonationDataShape = { ...normalized };
    const goal = parseOptionalJsonObject(normalized.goal, "$.goal", (entry) =>
      ArtistDonationGoal.fromJSON(entry));
    const donationGoal = parseOptionalJsonObject(normalized.donationGoal, "$.donationGoal", (entry) =>
      ArtistDonationGoal.fromJSON(entry));

    if (goal !== undefined) shape.goal = goal;
    if (donationGoal !== undefined) shape.donationGoal = donationGoal;

    return new this(shape);
  }
}
