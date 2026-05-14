import type { DeepReadonly, JsonObject } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject } from "../../core/parsing.ts";

export interface AlertButtonShape extends Record<string, unknown> {
  text?: string;
  color?: string;
  bgColor?: string;
  uri?: string;
}

export class AlertButton {
  declare readonly text?: string;
  declare readonly color?: string;
  declare readonly bgColor?: string;
  declare readonly uri?: string;

  constructor(shape: AlertButtonShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends AlertButton>(
    this: new (shape: AlertButtonShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    return new this(normalizeObject(json));
  }
}
