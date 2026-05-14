import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject, parseOptionalJsonObject } from "../../core/parsing.ts";
import { Concert } from "./Concert.ts";

export interface ConcertInfoShape extends Record<string, unknown> {
  concert?: Concert | null;
}

export class ConcertInfo {
  declare readonly concert?: Concert | null;

  constructor(shape: ConcertInfoShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends ConcertInfo>(
    this: new (shape: ConcertInfoShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeObject(json) as Record<string, JsonValue>;
    const shape: ConcertInfoShape = { ...normalized };
    const concert = parseOptionalJsonObject(normalized.concert, "$.concert", (entry) =>
      Concert.fromJSON(entry));

    if (concert !== undefined) shape.concert = concert;

    return new this(shape);
  }
}
