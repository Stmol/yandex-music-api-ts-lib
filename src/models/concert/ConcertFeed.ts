import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject, parseOptionalJsonObjectArray } from "../../core/parsing.ts";
import { ConcertFeedItem } from "./ConcertFeedItem.ts";

export interface ConcertFeedShape extends Record<string, unknown> {
  items?: readonly ConcertFeedItem[];
}

export class ConcertFeed {
  declare readonly items?: readonly ConcertFeedItem[];

  constructor(shape: ConcertFeedShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends ConcertFeed>(
    this: new (shape: ConcertFeedShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeObject(json) as Record<string, JsonValue>;
    const shape: ConcertFeedShape = { ...normalized };
    const items = parseOptionalJsonObjectArray(normalized.items, "$.items", (entry) =>
      ConcertFeedItem.fromJSON(entry));

    if (items !== undefined) shape.items = items;

    return new this(shape);
  }
}
