import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject, parseOptionalJsonObjectArray } from "../../core/parsing.ts";
import { Track } from "../track/Track.ts";

export interface StationTracksResultShape extends Record<string, unknown> {
  tracks?: readonly Track[];
}

export class StationTracksResult {
  declare readonly tracks?: readonly Track[];

  constructor(shape: StationTracksResultShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends StationTracksResult>(
    this: new (shape: StationTracksResultShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeObject(json) as Record<string, JsonValue>;
    const shape: StationTracksResultShape = { ...normalized };
    const tracks = parseOptionalJsonObjectArray(normalized.tracks, "$.tracks", (entry) =>
      Track.fromJSON(entry));

    if (tracks !== undefined) shape.tracks = tracks;

    return new this(shape);
  }
}
