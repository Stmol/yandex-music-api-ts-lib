import type { DeepReadonly, JsonObject } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject } from "../../core/parsing.ts";

export interface ChartInfoMenuItemShape extends Record<string, unknown> {
  title?: string;
  url?: string;
}

export class ChartInfoMenuItem {
  declare readonly title?: string;
  declare readonly url?: string;

  constructor(shape: ChartInfoMenuItemShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends ChartInfoMenuItem>(
    this: new (shape: ChartInfoMenuItemShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    return new this(normalizeObject(json));
  }
}
