import type { DeepReadonly, JsonObject } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject } from "../../core/parsing.ts";

export interface ConcertEventInfoShape extends Record<string, unknown> {
  id?: string | number;
  title?: string;
  startDate?: string;
}

export class ConcertEventInfo {
  declare readonly id?: string | number;
  declare readonly title?: string;
  declare readonly startDate?: string;

  constructor(shape: ConcertEventInfoShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends ConcertEventInfo>(
    this: new (shape: ConcertEventInfoShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    return new this(normalizeObject(json));
  }
}
