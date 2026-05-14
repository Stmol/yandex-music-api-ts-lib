import type { DeepReadonly, JsonObject } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject } from "../../core/parsing.ts";

export interface PlusShape extends Record<string, unknown> {
  hasPlus?: boolean;
  isTutorialCompleted?: boolean;
}

export class Plus {
  declare readonly hasPlus?: boolean;
  declare readonly isTutorialCompleted?: boolean;

  constructor(shape: PlusShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends Plus>(
    this: new (shape: PlusShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    return new this(normalizeObject(json));
  }
}
