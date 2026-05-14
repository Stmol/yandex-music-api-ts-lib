import type { DeepReadonly, JsonObject } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject } from "../../core/parsing.ts";

export interface DisclaimerShape extends Record<string, unknown> {
  title?: string;
  text?: string;
  buttonText?: string;
}

export class Disclaimer {
  declare readonly title?: string;
  declare readonly text?: string;
  declare readonly buttonText?: string;

  constructor(shape: DisclaimerShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends Disclaimer>(
    this: new (shape: DisclaimerShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    return new this(normalizeObject(json) as DisclaimerShape);
  }
}
