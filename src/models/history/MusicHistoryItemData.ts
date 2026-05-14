import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject, parseOptionalJsonObject } from "../../core/parsing.ts";
import { MusicHistoryContextFullModel } from "./MusicHistoryContextFullModel.ts";
import { MusicHistoryItemId } from "./MusicHistoryItemId.ts";

export interface MusicHistoryItemDataShape extends Record<string, unknown> {
  itemId?: MusicHistoryItemId | null;
  fullModel?: MusicHistoryContextFullModel | null;
}

export class MusicHistoryItemData {
  declare readonly itemId?: MusicHistoryItemId | null;
  declare readonly fullModel?: MusicHistoryContextFullModel | null;

  constructor(shape: MusicHistoryItemDataShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends MusicHistoryItemData>(
    this: new (shape: MusicHistoryItemDataShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeObject(json) as Record<string, JsonValue>;
    const shape: MusicHistoryItemDataShape = { ...normalized };
    const itemId = parseOptionalJsonObject(normalized.itemId, "$.itemId", (entry) =>
      MusicHistoryItemId.fromJSON(entry));
    const fullModel = parseOptionalJsonObject(normalized.fullModel, "$.fullModel", (entry) =>
      MusicHistoryContextFullModel.fromJSON(entry));

    if (itemId !== undefined) shape.itemId = itemId;
    if (fullModel !== undefined) shape.fullModel = fullModel;

    return new this(shape);
  }
}
