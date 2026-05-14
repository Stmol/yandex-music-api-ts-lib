import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject, parseOptionalJsonObjectArray } from "../../core/parsing.ts";
import { TrackShort } from "./TrackShort.ts";

export interface TracksListShape extends Record<string, unknown> {
  uid?: string | number;
  kind?: string | number;
  revision?: number;
  items?: readonly TrackShort[];
  trackIds?: readonly (string | number)[];
}

export class TracksList {
  declare readonly uid?: string | number;
  declare readonly kind?: string | number;
  declare readonly revision?: number;
  declare readonly items?: readonly TrackShort[];
  declare readonly trackIds?: readonly (string | number)[];

  constructor(shape: TracksListShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends TracksList>(
    this: new (shape: TracksListShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeObject(json) as Record<string, JsonValue>;
    const shape: TracksListShape = { ...normalized };
    const items = parseOptionalJsonObjectArray(normalized.items, "$.items", (entry) =>
      TrackShort.fromJSON(entry));

    if (items !== undefined) shape.items = items;
    if (Array.isArray(normalized.trackIds)) {
      shape.trackIds = normalized.trackIds.filter((entry): entry is string | number =>
        typeof entry === "string" || typeof entry === "number");
    }

    return new this(shape);
  }
}
