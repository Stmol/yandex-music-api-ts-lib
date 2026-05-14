import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject, parseOptionalJsonObject, parseOptionalJsonObjectArray } from "../../core/parsing.ts";
import { Video } from "../shared/Video.ts";
import { TrackLyrics } from "./TrackLyrics.ts";

export interface SupplementShape extends Record<string, unknown> {
  id?: string | number;
  lyrics?: TrackLyrics | null;
  videos?: readonly Video[];
}

export class Supplement {
  declare readonly id?: string | number;
  declare readonly lyrics?: TrackLyrics | null;
  declare readonly videos?: readonly Video[];

  constructor(shape: SupplementShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends Supplement>(
    this: new (shape: SupplementShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeObject(json) as Record<string, JsonValue>;
    const shape: SupplementShape = { ...normalized };
    const lyrics = parseOptionalJsonObject(normalized.lyrics, "$.lyrics", (entry) =>
      TrackLyrics.fromJSON(entry));
    const videos = parseOptionalJsonObjectArray(normalized.videos, "$.videos", (entry) =>
      Video.fromJSON(entry));

    if (lyrics !== undefined) shape.lyrics = lyrics;
    if (videos !== undefined) shape.videos = videos;

    return new this(shape);
  }
}
