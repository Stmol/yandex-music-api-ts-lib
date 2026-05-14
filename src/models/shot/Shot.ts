import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject, parseOptionalJsonObjectArray } from "../../core/parsing.ts";
import { ShotEvent } from "./ShotEvent.ts";

export interface ShotShape extends Record<string, unknown> {
  id?: string | number;
  title?: string;
  events?: readonly ShotEvent[];
}

export class Shot {
  declare readonly id?: string | number;
  declare readonly title?: string;
  declare readonly events?: readonly ShotEvent[];

  constructor(shape: ShotShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends Shot>(
    this: new (shape: ShotShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeObject(json) as Record<string, JsonValue>;
    const shape: ShotShape = { ...normalized };
    const events = parseOptionalJsonObjectArray(normalized.events, "$.events", (entry) =>
      ShotEvent.fromJSON(entry));

    if (events !== undefined) shape.events = events;

    return new this(shape);
  }
}
