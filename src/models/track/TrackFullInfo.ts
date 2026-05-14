import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject, parseOptionalJsonObject, parseOptionalJsonObjectArray } from "../../core/parsing.ts";
import { Album } from "../album/Album.ts";
import { SimilarTracks } from "./SimilarTracks.ts";
import { Supplement } from "./Supplement.ts";
import { Track } from "./Track.ts";

export interface TrackFullInfoShape extends Record<string, unknown> {
  track?: Track | null;
  albums?: readonly Album[];
  supplement?: Supplement | null;
  similarTracks?: SimilarTracks | null;
}

export class TrackFullInfo {
  declare readonly track?: Track | null;
  declare readonly albums?: readonly Album[];
  declare readonly supplement?: Supplement | null;
  declare readonly similarTracks?: SimilarTracks | null;

  constructor(shape: TrackFullInfoShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends TrackFullInfo>(
    this: new (shape: TrackFullInfoShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeObject(json) as Record<string, JsonValue>;
    const shape: TrackFullInfoShape = { ...normalized };
    const track = parseOptionalJsonObject(normalized.track, "$.track", (entry) =>
      Track.fromJSON(entry));
    const albums = parseOptionalJsonObjectArray(normalized.albums, "$.albums", (entry) =>
      Album.fromJSON(entry));
    const supplement = parseOptionalJsonObject(normalized.supplement, "$.supplement", (entry) =>
      Supplement.fromJSON(entry));
    const similarTracks = parseOptionalJsonObject(normalized.similarTracks, "$.similarTracks", (entry) =>
      SimilarTracks.fromJSON(entry));

    if (track !== undefined) shape.track = track;
    if (albums !== undefined) shape.albums = albums;
    if (supplement !== undefined) shape.supplement = supplement;
    if (similarTracks !== undefined) shape.similarTracks = similarTracks;

    return new this(shape);
  }
}
