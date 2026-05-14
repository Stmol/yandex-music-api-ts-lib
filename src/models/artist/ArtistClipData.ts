import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject, parseOptionalJsonObject } from "../../core/parsing.ts";
import { Clip } from "../clip/Clip.ts";

export interface ArtistClipDataShape extends Record<string, unknown> {
  clip?: Clip | null;
}

export class ArtistClipData {
  declare readonly clip?: Clip | null;

  constructor(shape: ArtistClipDataShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends ArtistClipData>(
    this: new (shape: ArtistClipDataShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeObject(json) as Record<string, JsonValue>;
    const shape: ArtistClipDataShape = { ...normalized };
    const clip = parseOptionalJsonObject(normalized.clip, "$.clip", (entry) =>
      Clip.fromJSON(entry));

    if (clip !== undefined) shape.clip = clip;

    return new this(shape);
  }
}
