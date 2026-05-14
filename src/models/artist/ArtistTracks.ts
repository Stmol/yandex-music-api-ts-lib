import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject, parseOptionalJsonObjectArray } from "../../core/parsing.ts";
import { Track } from "../track/Track.ts";

export interface ArtistTracksShape extends Record<string, unknown> {
  tracks?: readonly Track[];
}

export class ArtistTracks {
  declare readonly tracks?: readonly Track[];

  constructor(shape: ArtistTracksShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends ArtistTracks>(
    this: new (shape: ArtistTracksShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeObject(json) as Record<string, JsonValue>;
    const shape: ArtistTracksShape = { ...normalized };
    const tracks = parseOptionalJsonObjectArray(normalized.tracks, "$.tracks", (entry) =>
      Track.fromJSON(entry));

    if (tracks !== undefined) shape.tracks = tracks;

    return new this(shape);
  }
}
