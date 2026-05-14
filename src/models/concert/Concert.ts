import type { DeepReadonly, JsonObject } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject } from "../../core/parsing.ts";

export interface ConcertShape extends Record<string, unknown> {
  id?: string | number;
  title?: string;
}

export class Concert {
  declare readonly id?: string | number;
  declare readonly title?: string;

  constructor(shape: ConcertShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends Concert>(
    this: new (shape: ConcertShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    return new this(normalizeObject(json));
  }
}
