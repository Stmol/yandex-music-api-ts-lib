import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject, parseOptionalJsonObjectArray } from "../../core/parsing.ts";
import { ConcertLocation } from "./ConcertLocation.ts";

export interface ConcertLocationsShape extends Record<string, unknown> {
  locations?: readonly ConcertLocation[];
}

export class ConcertLocations {
  declare readonly locations?: readonly ConcertLocation[];

  constructor(shape: ConcertLocationsShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends ConcertLocations>(
    this: new (shape: ConcertLocationsShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeObject(json) as Record<string, JsonValue>;
    const shape: ConcertLocationsShape = { ...normalized };
    const locations = parseOptionalJsonObjectArray(normalized.locations, "$.locations", (entry) =>
      ConcertLocation.fromJSON(entry));

    if (locations !== undefined) shape.locations = locations;

    return new this(shape);
  }
}
