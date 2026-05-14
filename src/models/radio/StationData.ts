import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject, parseOptionalJsonObject } from "../../core/parsing.ts";
import { Station } from "./Station.ts";
import { RadioSettings } from "./RadioSettings.ts";
import { Restrictions } from "./Restrictions.ts";

export interface StationDataShape extends Record<string, unknown> {
  station?: Station | null;
  settings?: RadioSettings | null;
  restrictions?: Restrictions | null;
}

export class StationData {
  declare readonly station?: Station | null;
  declare readonly settings?: RadioSettings | null;
  declare readonly restrictions?: Restrictions | null;

  constructor(shape: StationDataShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends StationData>(
    this: new (shape: StationDataShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeObject(json) as Record<string, JsonValue>;
    const shape: StationDataShape = { ...normalized };
    const station = parseOptionalJsonObject(normalized.station, "$.station", (entry) =>
      Station.fromJSON(entry));
    const settings = parseOptionalJsonObject(normalized.settings, "$.settings", (entry) =>
      RadioSettings.fromJSON(entry));
    const restrictions = parseOptionalJsonObject(normalized.restrictions, "$.restrictions", (entry) =>
      Restrictions.fromJSON(entry));

    if (station !== undefined) shape.station = station;
    if (settings !== undefined) shape.settings = settings;
    if (restrictions !== undefined) shape.restrictions = restrictions;

    return new this(shape);
  }
}
