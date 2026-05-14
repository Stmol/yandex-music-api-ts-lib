import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject, parseOptionalJsonObject } from "../../core/parsing.ts";
import { Cover } from "./Cover.ts";

export interface VideoShape extends Record<string, unknown> {
  title?: string;
  cover?: Cover | null;
  embedUrl?: string;
  provider?: string;
  providerVideoId?: string;
  url?: string;
  thumbnailUrl?: string;
}

export class Video {
  declare readonly title?: string;
  declare readonly cover?: Cover | null;
  declare readonly embedUrl?: string;
  declare readonly provider?: string;
  declare readonly providerVideoId?: string;
  declare readonly url?: string;
  declare readonly thumbnailUrl?: string;

  constructor(shape: VideoShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends Video>(
    this: new (shape: VideoShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeObject(json) as Record<string, JsonValue>;
    const shape: VideoShape = { ...normalized };
    const cover = parseOptionalJsonObject(normalized.cover, "$.cover", (entry) =>
      Cover.fromJSON(entry));

    if (cover !== undefined) shape.cover = cover;

    return new this(shape);
  }

  getCoverUrl(size?: string): string | null {
    return this.cover?.getUrl(size) ?? this.thumbnailUrl ?? null;
  }
}
