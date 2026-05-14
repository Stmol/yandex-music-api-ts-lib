import type { DeepReadonly, JsonObject } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject } from "../../core/parsing.ts";

export interface ConcertDescriptionShape extends Record<string, unknown> {
  title?: string;
  text?: string;
}

export class ConcertDescription {
  declare readonly title?: string;
  declare readonly text?: string;

  constructor(shape: ConcertDescriptionShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends ConcertDescription>(
    this: new (shape: ConcertDescriptionShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    return new this(normalizeObject(json));
  }
}
