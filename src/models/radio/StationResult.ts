import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject, parseOptionalJsonObject } from "../../core/parsing.ts";
import { Station } from "./Station.ts";

export interface StationResultShape extends Record<string, unknown> {
  station?: Station | null;
}

export class StationResult {
  declare readonly station?: Station | null;

  constructor(shape: StationResultShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends StationResult>(
    this: new (shape: StationResultShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeObject(json) as Record<string, JsonValue>;
    const shape: StationResultShape = { ...normalized };
    const station = parseOptionalJsonObject(normalized.station, "$.station", (entry) =>
      Station.fromJSON(entry));

    if (station !== undefined) shape.station = station;

    return new this(shape);
  }
}
