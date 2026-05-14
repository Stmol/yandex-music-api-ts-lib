import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject, parseOptionalJsonObject } from "../../core/parsing.ts";
import { ConcertTabRange } from "./ConcertTabRange.ts";

export interface ConcertTabConfigDataShape extends Record<string, unknown> {
  range?: ConcertTabRange | null;
}

export class ConcertTabConfigData {
  declare readonly range?: ConcertTabRange | null;

  constructor(shape: ConcertTabConfigDataShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends ConcertTabConfigData>(
    this: new (shape: ConcertTabConfigDataShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeObject(json) as Record<string, JsonValue>;
    const shape: ConcertTabConfigDataShape = { ...normalized };
    const range = parseOptionalJsonObject(normalized.range, "$.range", (entry) =>
      ConcertTabRange.fromJSON(entry));

    if (range !== undefined) shape.range = range;

    return new this(shape);
  }
}
