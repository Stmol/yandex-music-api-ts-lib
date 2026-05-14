import type { DeepReadonly, JsonObject } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject } from "../../core/parsing.ts";

export interface ArtistDonationGoalShape extends Record<string, unknown> {
  amount?: number;
  currency?: string;
  progress?: number;
}

export class ArtistDonationGoal {
  declare readonly amount?: number;
  declare readonly currency?: string;
  declare readonly progress?: number;

  constructor(shape: ArtistDonationGoalShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends ArtistDonationGoal>(
    this: new (shape: ArtistDonationGoalShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    return new this(normalizeObject(json));
  }
}
