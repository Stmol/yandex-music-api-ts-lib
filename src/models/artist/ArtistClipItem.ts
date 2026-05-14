import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject, parseOptionalJsonObject } from "../../core/parsing.ts";
import { ArtistClipData } from "./ArtistClipData.ts";

export interface ArtistClipItemShape extends Record<string, unknown> {
  type?: string;
  data?: ArtistClipData | null;
}

export class ArtistClipItem {
  declare readonly type?: string;
  declare readonly data?: ArtistClipData | null;

  constructor(shape: ArtistClipItemShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends ArtistClipItem>(
    this: new (shape: ArtistClipItemShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeObject(json) as Record<string, JsonValue>;
    const shape: ArtistClipItemShape = { ...normalized };
    const data = parseOptionalJsonObject(normalized.data, "$.data", (entry) =>
      ArtistClipData.fromJSON(entry));

    if (data !== undefined) shape.data = data;

    return new this(shape);
  }
}
