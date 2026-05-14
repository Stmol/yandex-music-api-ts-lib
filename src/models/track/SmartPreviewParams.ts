import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject, parseOptionalJsonObject } from "../../core/parsing.ts";
import { Fade } from "./Fade.ts";

export interface SmartPreviewParamsShape extends Record<string, unknown> {
  fade?: Fade | null;
}

export class SmartPreviewParams {
  declare readonly fade?: Fade | null;

  constructor(shape: SmartPreviewParamsShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends SmartPreviewParams>(
    this: new (shape: SmartPreviewParamsShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeObject(json) as Record<string, JsonValue>;
    const shape: SmartPreviewParamsShape = { ...normalized };
    const fade = parseOptionalJsonObject(normalized.fade, "$.fade", (entry) =>
      Fade.fromJSON(entry));

    if (fade !== undefined) shape.fade = fade;

    return new this(shape);
  }
}
