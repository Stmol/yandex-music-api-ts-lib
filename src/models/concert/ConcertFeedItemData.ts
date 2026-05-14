import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject, parseOptionalJsonObject } from "../../core/parsing.ts";
import { Concert } from "./Concert.ts";

export interface ConcertFeedItemDataShape extends Record<string, unknown> {
  concert?: Concert | null;
}

export class ConcertFeedItemData {
  declare readonly concert?: Concert | null;

  constructor(shape: ConcertFeedItemDataShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends ConcertFeedItemData>(
    this: new (shape: ConcertFeedItemDataShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeObject(json) as Record<string, JsonValue>;
    const shape: ConcertFeedItemDataShape = { ...normalized };
    const concert = parseOptionalJsonObject(normalized.concert, "$.concert", (entry) =>
      Concert.fromJSON(entry));

    if (concert !== undefined) shape.concert = concert;

    return new this(shape);
  }
}
