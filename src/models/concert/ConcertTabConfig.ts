import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject, parseOptionalJsonObject } from "../../core/parsing.ts";
import { ConcertTabConfigData } from "./ConcertTabConfigData.ts";

export interface ConcertTabConfigShape extends Record<string, unknown> {
  type?: string;
  data?: ConcertTabConfigData | null;
}

export class ConcertTabConfig {
  declare readonly type?: string;
  declare readonly data?: ConcertTabConfigData | null;

  constructor(shape: ConcertTabConfigShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends ConcertTabConfig>(
    this: new (shape: ConcertTabConfigShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeObject(json) as Record<string, JsonValue>;
    const shape: ConcertTabConfigShape = { ...normalized };
    const data = parseOptionalJsonObject(normalized.data, "$.data", (entry) =>
      ConcertTabConfigData.fromJSON(entry));

    if (data !== undefined) shape.data = data;

    return new this(shape);
  }
}
