import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject, parseOptionalJsonObject } from "../../core/parsing.ts";
import { ConcertFeedItemData } from "./ConcertFeedItemData.ts";

export interface ConcertFeedItemShape extends Record<string, unknown> {
  type?: string;
  data?: ConcertFeedItemData | null;
}

export class ConcertFeedItem {
  declare readonly type?: string;
  declare readonly data?: ConcertFeedItemData | null;

  constructor(shape: ConcertFeedItemShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends ConcertFeedItem>(
    this: new (shape: ConcertFeedItemShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeObject(json) as Record<string, JsonValue>;
    const shape: ConcertFeedItemShape = { ...normalized };
    const data = parseOptionalJsonObject(normalized.data, "$.data", (entry) =>
      ConcertFeedItemData.fromJSON(entry));

    if (data !== undefined) shape.data = data;

    return new this(shape);
  }
}
