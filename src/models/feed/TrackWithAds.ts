import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject, parseOptionalJsonObject } from "../../core/parsing.ts";
import { Track } from "../track/Track.ts";

export interface TrackWithAdsShape extends Record<string, unknown> {
  track?: Track | null;
}

export class TrackWithAds {
  declare readonly track?: Track | null;

  constructor(shape: TrackWithAdsShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends TrackWithAds>(
    this: new (shape: TrackWithAdsShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeObject(json) as Record<string, JsonValue>;
    const shape: TrackWithAdsShape = { ...normalized };
    const track = parseOptionalJsonObject(normalized.track, "$.track", (entry) =>
      Track.fromJSON(entry));

    if (track !== undefined) shape.track = track;

    return new this(shape);
  }
}
