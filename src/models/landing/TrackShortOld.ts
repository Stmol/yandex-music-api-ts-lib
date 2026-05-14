import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { isJsonObject, normalizeObject, parseOptionalJsonObject } from "../../core/parsing.ts";
import { TrackId } from "./TrackId.ts";

export interface TrackShortOldShape extends Record<string, unknown> {
  id?: TrackId | string | number | null;
  title?: string;
}

export class TrackShortOld {
  declare readonly id?: TrackId | string | number | null;
  declare readonly title?: string;

  constructor(shape: TrackShortOldShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends TrackShortOld>(
    this: new (shape: TrackShortOldShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeObject(json) as Record<string, JsonValue>;
    const shape: TrackShortOldShape = { ...normalized };
    const id = isJsonObject(normalized.id)
      ? parseOptionalJsonObject(normalized.id, "$.id", (entry) =>
          TrackId.fromJSON(entry))
      : undefined;

    if (id !== undefined) shape.id = id;

    return new this(shape);
  }
}
