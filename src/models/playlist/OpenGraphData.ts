import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject, parseOptionalJsonObject } from "../../core/parsing.ts";
import { Cover } from "../shared/Cover.ts";

export interface OpenGraphDataShape extends Record<string, unknown> {
  title?: string;
  description?: string;
  image?: string;
  cover?: Cover | null;
}

export class OpenGraphData {
  declare readonly title?: string;
  declare readonly description?: string;
  declare readonly image?: string;
  declare readonly cover?: Cover | null;

  constructor(shape: OpenGraphDataShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends OpenGraphData>(
    this: new (shape: OpenGraphDataShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeObject(json) as Record<string, JsonValue>;
    const shape: OpenGraphDataShape = { ...normalized };
    const cover = parseOptionalJsonObject(normalized.cover, "$.cover", (entry) =>
      Cover.fromJSON(entry));

    if (cover !== undefined) shape.cover = cover;

    return new this(shape);
  }
}
