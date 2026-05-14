import type { DeepReadonly, JsonObject } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject } from "../../core/parsing.ts";

export interface TrackPositionShape extends Record<string, unknown> {
  volume?: number;
  index?: number;
}

export class TrackPosition {
  declare readonly volume?: number;
  declare readonly index?: number;

  constructor(shape: TrackPositionShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends TrackPosition>(
    this: new (shape: TrackPositionShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    return new this(normalizeObject(json));
  }
}
