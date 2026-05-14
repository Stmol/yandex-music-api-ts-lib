import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject, parseOptionalJsonObject, parseOptionalJsonObjectArray } from "../../core/parsing.ts";
import { Album } from "../album/Album.ts";
import { Artist } from "../artist/Artist.ts";
import { Cover } from "../shared/Cover.ts";
import type { TrackShortShape } from "../shared/TrackShort.ts";
import { LyricsInfo } from "./LyricsInfo.ts";
import { Major } from "./Major.ts";
import { MetaData } from "./MetaData.ts";
import { Normalization } from "./Normalization.ts";
import { R128 } from "./R128.ts";

export interface TrackShape extends Record<string, unknown>, TrackShortShape {
  artists?: readonly Artist[];
  albums?: readonly Album[];
  cover?: Cover | null;
  lyricsAvailable?: boolean;
  major?: Major | null;
  normalization?: Normalization | null;
  r128?: R128 | null;
  lyricsInfo?: LyricsInfo | null;
  metaData?: MetaData | null;
  substituted?: Track | null;
  matchedTrack?: Track | null;
  previewDurationMs?: number;
  explicit?: boolean;
  type?: string;
  ogImage?: string;
}

export class Track {
  declare readonly id?: string | number;
  declare readonly realId?: string | number;
  declare readonly title?: string;
  declare readonly version?: string | null;
  declare readonly durationMs?: number;
  declare readonly available?: boolean;
  declare readonly coverUri?: string | null;
  declare readonly contentWarning?: string | null;
  declare readonly artists?: readonly Artist[];
  declare readonly albums?: readonly Album[];
  declare readonly cover?: Cover | null;
  declare readonly lyricsAvailable?: boolean;
  declare readonly major?: Major | null;
  declare readonly normalization?: Normalization | null;
  declare readonly r128?: R128 | null;
  declare readonly lyricsInfo?: LyricsInfo | null;
  declare readonly metaData?: MetaData | null;
  declare readonly substituted?: Track | null;
  declare readonly matchedTrack?: Track | null;
  declare readonly previewDurationMs?: number;
  declare readonly explicit?: boolean;
  declare readonly type?: string;
  declare readonly ogImage?: string;

  constructor(shape: TrackShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends Track>(
    this: new (shape: TrackShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeObject(json) as Record<string, JsonValue>;
    const shape: TrackShape = { ...normalized };
    const artists = parseOptionalJsonObjectArray(normalized.artists, "$.artists", (entry) =>
      Artist.fromJSON(entry));
    const albums = parseOptionalJsonObjectArray(normalized.albums, "$.albums", (entry) =>
      Album.fromJSON(entry));
    const cover = parseOptionalJsonObject(normalized.cover, "$.cover", (entry) =>
      Cover.fromJSON(entry));
    const major = parseOptionalJsonObject(normalized.major, "$.major", (entry) =>
      Major.fromJSON(entry));
    const normalization = parseOptionalJsonObject(normalized.normalization, "$.normalization", (entry) =>
      Normalization.fromJSON(entry));
    const r128 = parseOptionalJsonObject(normalized.r128, "$.r128", (entry) =>
      R128.fromJSON(entry));
    const lyricsInfo = parseOptionalJsonObject(normalized.lyricsInfo, "$.lyricsInfo", (entry) =>
      LyricsInfo.fromJSON(entry));
    const metaData = parseOptionalJsonObject(normalized.metaData, "$.metaData", (entry) =>
      MetaData.fromJSON(entry));
    const substituted = parseOptionalJsonObject(normalized.substituted, "$.substituted", (entry) =>
      Track.fromJSON(entry));
    const matchedTrack = parseOptionalJsonObject(normalized.matchedTrack, "$.matchedTrack", (entry) =>
      Track.fromJSON(entry));

    if (artists !== undefined) {
      shape.artists = artists;
    }

    if (albums !== undefined) {
      shape.albums = albums;
    }

    if (cover !== undefined) shape.cover = cover;
    if (major !== undefined) shape.major = major;
    if (normalization !== undefined) shape.normalization = normalization;
    if (r128 !== undefined) shape.r128 = r128;
    if (lyricsInfo !== undefined) shape.lyricsInfo = lyricsInfo;
    if (metaData !== undefined) shape.metaData = metaData;
    if (substituted !== undefined) shape.substituted = substituted;
    if (matchedTrack !== undefined) shape.matchedTrack = matchedTrack;

    return new this(shape);
  }

  get displayTitle(): string | null {
    if (typeof this.title !== "string" || this.title.length === 0) {
      return null;
    }

    if (typeof this.version !== "string" || this.version.length === 0) {
      return this.title;
    }

    return `${this.title} (${this.version})`;
  }

  get durationSeconds(): number | null {
    return typeof this.durationMs === "number" ? Math.floor(this.durationMs / 1000) : null;
  }

  get artistsNames(): readonly string[] {
    return (this.artists ?? [])
      .map((artist) => artist.displayName)
      .filter((value): value is string => value !== null);
  }

  getCoverUrl(size?: string): string | null {
    if (this.cover !== undefined && this.cover !== null) {
      return this.cover.getUrl(size);
    }

    if (typeof this.coverUri !== "string" || this.coverUri.length === 0) {
      return null;
    }

    return new Cover({ uri: this.coverUri }).getUrl(size);
  }
}
