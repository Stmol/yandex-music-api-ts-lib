import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { expectJsonObject, normalizeObject } from "../../core/parsing.ts";
import { Album } from "../album/Album.ts";
import { Artist } from "../artist/Artist.ts";
import { Pager } from "../shared/Pager.ts";
import { Track } from "../track/Track.ts";
import { Playlist } from "../playlist/Playlist.ts";
import { parseSearchBestResult } from "./BestResult.ts";

export interface SearchBestResultShape {
  type?: string;
  result?: Artist | Album | Track | Playlist | null;
  text?: string;
}

export interface SearchShape extends Record<string, unknown> {
  text?: string;
  noCorrect?: boolean;
  best?: SearchBestResultShape | null;
  artists?: Pager<Artist> | null;
  albums?: Pager<Album> | null;
  tracks?: Pager<Track> | null;
  playlists?: Pager<Playlist> | null;
}

function parsePager<TItem>(
  value: JsonValue | undefined,
  parseItem: (entry: JsonObject) => TItem,
): Pager<TItem> | null | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  const normalized = normalizeObject(expectJsonObject(value, "$.pager")) as Record<string, JsonValue>;
  const pagerShape: {
    page?: number;
    perPage?: number;
    total?: number;
    count?: number;
    items?: readonly TItem[];
  } = {
    ...normalized,
  };

  if (Array.isArray(normalized.items)) {
    pagerShape.items = normalized.items.map((entry, index) =>
      parseItem(expectJsonObject(entry, `$.pager.items[${index}]`)));
  }

  return new Pager<TItem>(pagerShape);
}

export class Search {
  declare readonly text?: string;
  declare readonly noCorrect?: boolean;
  declare readonly best?: SearchBestResultShape | null;
  declare readonly artists?: Pager<Artist> | null;
  declare readonly albums?: Pager<Album> | null;
  declare readonly tracks?: Pager<Track> | null;
  declare readonly playlists?: Pager<Playlist> | null;

  constructor(shape: SearchShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends Search>(
    this: new (shape: SearchShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeObject(json) as Record<string, JsonValue>;
    const shape: SearchShape = { ...normalized };
    const best = parseSearchBestResult(normalized.best);
    const artists = parsePager(normalized.artists, (entry) => Artist.fromJSON(entry));
    const albums = parsePager(normalized.albums, (entry) => Album.fromJSON(entry));
    const tracks = parsePager(normalized.tracks, (entry) => Track.fromJSON(entry));
    const playlists = parsePager(normalized.playlists, (entry) => Playlist.fromJSON(entry));

    if (best !== undefined) {
      shape.best = best;
    }

    if (artists !== undefined) {
      shape.artists = artists;
    }

    if (albums !== undefined) {
      shape.albums = albums;
    }

    if (tracks !== undefined) {
      shape.tracks = tracks;
    }

    if (playlists !== undefined) {
      shape.playlists = playlists;
    }

    return new this(shape);
  }

  get hasResults(): boolean {
    return (this.best?.result ?? null) !== null
      || (this.artists?.items?.length ?? 0) > 0
      || (this.albums?.items?.length ?? 0) > 0
      || (this.tracks?.items?.length ?? 0) > 0
      || (this.playlists?.items?.length ?? 0) > 0;
  }
}
