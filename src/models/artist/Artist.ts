import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { normalizeTopLevelKeys } from "../../core/normalize.ts";
import { Cover } from "../shared/Cover.ts";

export interface ArtistCounts {
  tracks?: number;
  directAlbums?: number;
  alsoAlbums?: number;
  alsoTracks?: number;
}

export interface ArtistShape extends Record<string, unknown> {
  id?: string | number;
  name?: string;
  various?: boolean;
  composer?: boolean;
  genres?: readonly string[];
  counts?: ArtistCounts | null;
  cover?: Cover | null;
}

function isJsonObject(value: JsonValue | undefined): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export class Artist {
  declare readonly id?: string | number;
  declare readonly name?: string;
  declare readonly various?: boolean;
  declare readonly composer?: boolean;
  declare readonly genres?: readonly string[];
  declare readonly counts?: ArtistCounts | null;
  declare readonly cover?: Cover | null;

  constructor(shape: ArtistShape) {
    Object.assign(this, shape);
  }

  static fromJSON<TModel extends Artist>(
    this: new (shape: ArtistShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeTopLevelKeys(json) as Record<string, JsonValue>;
    const shape: ArtistShape = { ...normalized };

    if (isJsonObject(normalized.cover)) {
      shape.cover = Cover.fromJSON(normalized.cover);
    }

    if (isJsonObject(normalized.counts)) {
      shape.counts = normalizeTopLevelKeys(normalized.counts) as ArtistCounts;
    }

    return new this(shape);
  }

  get displayName(): string | null {
    return typeof this.name === "string" && this.name.length > 0 ? this.name : null;
  }

  getCoverUrl(size?: string): string | null {
    return this.cover?.getUrl(size) ?? null;
  }
}
