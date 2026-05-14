import type { DeepReadonly, JsonObject } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject } from "../../core/parsing.ts";

export interface ForeignAgentShape extends Record<string, unknown> {
  id?: string | number;
  title?: string;
  name?: string;
  category?: string;
}

export class ForeignAgent {
  declare readonly id?: string | number;
  declare readonly title?: string;
  declare readonly name?: string;
  declare readonly category?: string;

  constructor(shape: ForeignAgentShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends ForeignAgent>(
    this: new (shape: ForeignAgentShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    return new this(normalizeObject(json));
  }
}
