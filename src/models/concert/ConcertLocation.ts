import type { DeepReadonly, JsonObject } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject } from "../../core/parsing.ts";

export interface ConcertLocationShape extends Record<string, unknown> {
  id?: string | number;
  title?: string;
}

export class ConcertLocation {
  declare readonly id?: string | number;
  declare readonly title?: string;

  constructor(shape: ConcertLocationShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends ConcertLocation>(
    this: new (shape: ConcertLocationShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    return new this(normalizeObject(json));
  }
}
