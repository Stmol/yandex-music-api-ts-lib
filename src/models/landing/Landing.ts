import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject, parseOptionalJsonObjectArray } from "../../core/parsing.ts";
import { Album } from "../album/Album.ts";
import { Artist } from "../artist/Artist.ts";
import { Playlist } from "../playlist/Playlist.ts";
import { Track } from "../track/Track.ts";
import { Block } from "./Block.ts";
import { LandingList } from "./LandingList.ts";
import { TagResult } from "./TagResult.ts";

export interface LandingShape extends Record<string, unknown> {
  blocks?: readonly Block[];
  lists?: readonly LandingList[];
  tagResults?: readonly TagResult[];
  albums?: readonly Album[];
  playlists?: readonly Playlist[];
  tracks?: readonly Track[];
  artists?: readonly Artist[];
}

export class Landing {
  declare readonly blocks?: readonly Block[];
  declare readonly lists?: readonly LandingList[];
  declare readonly tagResults?: readonly TagResult[];
  declare readonly albums?: readonly Album[];
  declare readonly playlists?: readonly Playlist[];
  declare readonly tracks?: readonly Track[];
  declare readonly artists?: readonly Artist[];

  constructor(shape: LandingShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends Landing>(
    this: new (shape: LandingShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeObject(json) as Record<string, JsonValue>;
    const shape: LandingShape = { ...normalized };
    const blocks = parseOptionalJsonObjectArray(normalized.blocks, "$.blocks", (entry) =>
      Block.fromJSON(entry));
    const lists = parseOptionalJsonObjectArray(normalized.lists, "$.lists", (entry) =>
      LandingList.fromJSON(entry));
    const tagResults = parseOptionalJsonObjectArray(normalized.tagResults, "$.tagResults", (entry) =>
      TagResult.fromJSON(entry));
    const albums = parseOptionalJsonObjectArray(normalized.albums, "$.albums", (entry) =>
      Album.fromJSON(entry));
    const playlists = parseOptionalJsonObjectArray(normalized.playlists, "$.playlists", (entry) =>
      Playlist.fromJSON(entry));
    const tracks = parseOptionalJsonObjectArray(normalized.tracks, "$.tracks", (entry) =>
      Track.fromJSON(entry));
    const artists = parseOptionalJsonObjectArray(normalized.artists, "$.artists", (entry) =>
      Artist.fromJSON(entry));

    if (blocks !== undefined) {
      shape.blocks = blocks;
    }
    if (lists !== undefined) shape.lists = lists;
    if (tagResults !== undefined) shape.tagResults = tagResults;
    if (albums !== undefined) shape.albums = albums;
    if (playlists !== undefined) shape.playlists = playlists;
    if (tracks !== undefined) shape.tracks = tracks;
    if (artists !== undefined) shape.artists = artists;

    return new this(shape);
  }

  get blockCount(): number {
    return this.blocks?.length ?? 0;
  }

  findBlock(type: string): Block | undefined {
    return this.blocks?.find((block) => block.type === type);
  }
}
