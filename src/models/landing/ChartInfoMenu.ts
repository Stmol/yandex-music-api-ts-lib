import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject, parseOptionalJsonObjectArray } from "../../core/parsing.ts";
import { ChartInfoMenuItem } from "./ChartInfoMenuItem.ts";

export interface ChartInfoMenuShape extends Record<string, unknown> {
  items?: readonly ChartInfoMenuItem[];
}

export class ChartInfoMenu {
  declare readonly items?: readonly ChartInfoMenuItem[];

  constructor(shape: ChartInfoMenuShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends ChartInfoMenu>(
    this: new (shape: ChartInfoMenuShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeObject(json) as Record<string, JsonValue>;
    const shape: ChartInfoMenuShape = { ...normalized };
    const items = parseOptionalJsonObjectArray(normalized.items, "$.items", (entry) =>
      ChartInfoMenuItem.fromJSON(entry));

    if (items !== undefined) shape.items = items;

    return new this(shape);
  }
}
