import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject, parseOptionalJsonObjectArray } from "../../core/parsing.ts";
import { ArtistClipItem } from "./ArtistClipItem.ts";

export interface ArtistClipsShape extends Record<string, unknown> {
  items?: readonly ArtistClipItem[];
}

export class ArtistClips {
  declare readonly items?: readonly ArtistClipItem[];

  constructor(shape: ArtistClipsShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends ArtistClips>(
    this: new (shape: ArtistClipsShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeObject(json) as Record<string, JsonValue>;
    const shape: ArtistClipsShape = { ...normalized };
    const items = parseOptionalJsonObjectArray(normalized.items, "$.items", (entry) =>
      ArtistClipItem.fromJSON(entry));

    if (items !== undefined) shape.items = items;

    return new this(shape);
  }
}
