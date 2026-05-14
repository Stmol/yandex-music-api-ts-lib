import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject, parseOptionalJsonObject } from "../../core/parsing.ts";
import { ShotData } from "./ShotData.ts";

export interface ShotEventShape extends Record<string, unknown> {
  type?: string;
  data?: ShotData | null;
}

export class ShotEvent {
  declare readonly type?: string;
  declare readonly data?: ShotData | null;

  constructor(shape: ShotEventShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends ShotEvent>(
    this: new (shape: ShotEventShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeObject(json) as Record<string, JsonValue>;
    const shape: ShotEventShape = { ...normalized };
    const data = parseOptionalJsonObject(normalized.data, "$.data", (entry) =>
      ShotData.fromJSON(entry));

    if (data !== undefined) shape.data = data;

    return new this(shape);
  }
}
