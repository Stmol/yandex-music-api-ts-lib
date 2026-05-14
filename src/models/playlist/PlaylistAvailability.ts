import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject, parseOptionalJsonObject } from "../../core/parsing.ts";
import { PlaylistAbsence } from "./PlaylistAbsence.ts";

export interface PlaylistAvailabilityShape extends Record<string, unknown> {
  available?: boolean;
  reason?: string;
  absence?: PlaylistAbsence | null;
}

export class PlaylistAvailability {
  declare readonly available?: boolean;
  declare readonly reason?: string;
  declare readonly absence?: PlaylistAbsence | null;

  constructor(shape: PlaylistAvailabilityShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends PlaylistAvailability>(
    this: new (shape: PlaylistAvailabilityShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeObject(json) as Record<string, JsonValue>;
    const shape: PlaylistAvailabilityShape = { ...normalized };
    const absence = parseOptionalJsonObject(normalized.absence, "$.absence", (entry) =>
      PlaylistAbsence.fromJSON(entry));

    if (absence !== undefined) shape.absence = absence;

    return new this(shape);
  }
}
