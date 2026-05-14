import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject, parseOptionalJsonObjectArray } from "../../core/parsing.ts";
import { Station } from "./Station.ts";

export interface DashboardShape extends Record<string, unknown> {
  stations?: readonly Station[];
}

export class Dashboard {
  declare readonly stations?: readonly Station[];

  constructor(shape: DashboardShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends Dashboard>(
    this: new (shape: DashboardShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeObject(json) as Record<string, JsonValue>;
    const shape: DashboardShape = { ...normalized };
    const stations = parseOptionalJsonObjectArray(normalized.stations, "$.stations", (entry) =>
      Station.fromJSON(entry));

    if (stations !== undefined) shape.stations = stations;

    return new this(shape);
  }
}
