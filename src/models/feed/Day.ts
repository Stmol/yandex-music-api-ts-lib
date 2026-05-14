import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject, parseOptionalJsonObjectArray } from "../../core/parsing.ts";
import { Event } from "./Event.ts";

export interface DayShape extends Record<string, unknown> {
  day?: string;
  events?: readonly Event[];
}

export class Day {
  declare readonly day?: string;
  declare readonly events?: readonly Event[];

  constructor(shape: DayShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends Day>(
    this: new (shape: DayShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeObject(json) as Record<string, JsonValue>;
    const shape: DayShape = { ...normalized };
    const events = parseOptionalJsonObjectArray(normalized.events, "$.events", (entry) =>
      Event.fromJSON(entry));

    if (events !== undefined) shape.events = events;

    return new this(shape);
  }
}
