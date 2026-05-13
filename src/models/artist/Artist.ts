import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject, parseOptionalJsonObject } from "../../core/parsing.ts";
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

export class Artist {
  declare readonly id?: string | number;
  declare readonly name?: string;
  declare readonly various?: boolean;
  declare readonly composer?: boolean;
  declare readonly genres?: readonly string[];
  declare readonly counts?: ArtistCounts | null;
  declare readonly cover?: Cover | null;

  constructor(shape: ArtistShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends Artist>(
    this: new (shape: ArtistShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeObject(json) as Record<string, JsonValue>;
    const shape: ArtistShape = { ...normalized };
    const cover = parseOptionalJsonObject(normalized.cover, "$.cover", (entry) =>
      Cover.fromJSON(entry));
    const counts = parseOptionalJsonObject(normalized.counts, "$.counts", (entry) =>
      normalizeObject(entry) as ArtistCounts);

    if (cover !== undefined) shape.cover = cover;
    if (counts !== undefined) shape.counts = counts;

    return new this(shape);
  }

  get displayName(): string | null {
    return typeof this.name === "string" && this.name.length > 0 ? this.name : null;
  }

  getCoverUrl(size?: string): string | null {
    return this.cover?.getUrl(size) ?? null;
  }
}
