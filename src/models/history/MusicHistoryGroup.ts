import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject, parseOptionalJsonObjectArray } from "../../core/parsing.ts";
import { MusicHistoryItem } from "./MusicHistoryItem.ts";

export interface MusicHistoryGroupShape extends Record<string, unknown> {
  title?: string;
  items?: readonly MusicHistoryItem[];
}

export class MusicHistoryGroup {
  declare readonly title?: string;
  declare readonly items?: readonly MusicHistoryItem[];

  constructor(shape: MusicHistoryGroupShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends MusicHistoryGroup>(
    this: new (shape: MusicHistoryGroupShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeObject(json) as Record<string, JsonValue>;
    const shape: MusicHistoryGroupShape = { ...normalized };
    const items = parseOptionalJsonObjectArray(normalized.items, "$.items", (entry) =>
      MusicHistoryItem.fromJSON(entry));

    if (items !== undefined) shape.items = items;

    return new this(shape);
  }
}
