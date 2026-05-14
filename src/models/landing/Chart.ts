import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject, parseOptionalJsonObjectArray } from "../../core/parsing.ts";
import { ChartItem } from "./ChartItem.ts";

export interface ChartShape extends Record<string, unknown> {
  title?: string;
  items?: readonly ChartItem[];
}

export class Chart {
  declare readonly title?: string;
  declare readonly items?: readonly ChartItem[];

  constructor(shape: ChartShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends Chart>(
    this: new (shape: ChartShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeObject(json) as Record<string, JsonValue>;
    const shape: ChartShape = { ...normalized };
    const items = parseOptionalJsonObjectArray(normalized.items, "$.items", (entry) =>
      ChartItem.fromJSON(entry));

    if (items !== undefined) shape.items = items;

    return new this(shape);
  }
}
