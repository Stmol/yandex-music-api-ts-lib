import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { expectJsonObject, normalizeObject, parseOptionalJsonObject } from "../../core/parsing.ts";
import { Cover } from "../shared/Cover.ts";
import { ArtistLink } from "./ArtistLink.ts";
import { ArtistLinks } from "./ArtistLinks.ts";
import { Description } from "./Description.ts";
import { Ratings } from "./Ratings.ts";

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
  ratings?: Ratings | null;
  links?: ArtistLinks | null;
  description?: Description | null;
  ogImage?: string;
}

export class Artist {
  declare readonly id?: string | number;
  declare readonly name?: string;
  declare readonly various?: boolean;
  declare readonly composer?: boolean;
  declare readonly genres?: readonly string[];
  declare readonly counts?: ArtistCounts | null;
  declare readonly cover?: Cover | null;
  declare readonly ratings?: Ratings | null;
  declare readonly links?: ArtistLinks | null;
  declare readonly description?: Description | null;
  declare readonly ogImage?: string;

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
    const ratings = parseOptionalJsonObject(normalized.ratings, "$.ratings", (entry) =>
      Ratings.fromJSON(entry));
    const links = parseLinks(normalized.links);
    const description = parseOptionalJsonObject(normalized.description, "$.description", (entry) =>
      Description.fromJSON(entry));

    if (cover !== undefined) shape.cover = cover;
    if (counts !== undefined) shape.counts = counts;
    if (ratings !== undefined) shape.ratings = ratings;
    if (links !== undefined) shape.links = links;
    if (description !== undefined) shape.description = description;

    return new this(shape);
  }

  get displayName(): string | null {
    return typeof this.name === "string" && this.name.length > 0 ? this.name : null;
  }

  getCoverUrl(size?: string): string | null {
    return this.cover?.getUrl(size) ?? null;
  }
}

function parseLinks(value: JsonValue | undefined): ArtistLinks | null | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  if (Array.isArray(value)) {
    return new ArtistLinks({
      links: value.map((entry, index) =>
        ArtistLink.fromJSON(expectJsonObject(entry, `$.links[${index}]`))),
    });
  }

  return ArtistLinks.fromJSON(expectJsonObject(value, "$.links"));
}
