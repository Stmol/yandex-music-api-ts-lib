import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject, parseOptionalJsonObject } from "../../core/parsing.ts";
import { MusicHistoryItemData } from "./MusicHistoryItemData.ts";

export interface MusicHistoryItemShape extends Record<string, unknown> {
  type?: string;
  data?: MusicHistoryItemData | null;
}

export class MusicHistoryItem {
  declare readonly type?: string;
  declare readonly data?: MusicHistoryItemData | null;

  constructor(shape: MusicHistoryItemShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends MusicHistoryItem>(
    this: new (shape: MusicHistoryItemShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeObject(json) as Record<string, JsonValue>;
    const shape: MusicHistoryItemShape = { ...normalized };
    const data = parseOptionalJsonObject(normalized.data, "$.data", (entry) =>
      MusicHistoryItemData.fromJSON(entry));

    if (data !== undefined) shape.data = data;

    return new this(shape);
  }
}
