import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject, parseOptionalJsonObject, parseOptionalJsonObjectArray } from "../../core/parsing.ts";
import { AlertButton } from "./AlertButton.ts";

export interface AlertShape extends Record<string, unknown> {
  alertId?: string;
  title?: string;
  text?: string;
  bgColor?: string;
  button?: AlertButton | null;
  buttons?: readonly AlertButton[];
}

export class Alert {
  declare readonly alertId?: string;
  declare readonly title?: string;
  declare readonly text?: string;
  declare readonly bgColor?: string;
  declare readonly button?: AlertButton | null;
  declare readonly buttons?: readonly AlertButton[];

  constructor(shape: AlertShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends Alert>(
    this: new (shape: AlertShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeObject(json) as Record<string, JsonValue>;
    const shape: AlertShape = { ...normalized };
    const button = parseOptionalJsonObject(normalized.button, "$.button", (entry) =>
      AlertButton.fromJSON(entry));
    const buttons = parseOptionalJsonObjectArray(normalized.buttons, "$.buttons", (entry) =>
      AlertButton.fromJSON(entry));

    if (button !== undefined) shape.button = button;
    if (buttons !== undefined) shape.buttons = buttons;

    return new this(shape);
  }
}
