import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject, parseOptionalJsonObjectArray } from "../../core/parsing.ts";
import { Playlist } from "../playlist/Playlist.ts";

export interface FeedDayShape extends Record<string, unknown> {
  day?: string;
  events?: readonly FeedEventShape[];
}

export interface FeedEventShape extends Record<string, unknown> {
  type?: string;
  title?: string;
  data?: JsonValue;
}

export interface FeedShape extends Record<string, unknown> {
  generatedPlaylists?: readonly Playlist[];
  playlists?: readonly Playlist[];
  days?: readonly FeedDayShape[];
  events?: readonly FeedEventShape[];
}

export class Feed {
  declare readonly generatedPlaylists?: readonly Playlist[];
  declare readonly playlists?: readonly Playlist[];
  declare readonly days?: readonly FeedDayShape[];
  declare readonly events?: readonly FeedEventShape[];

  constructor(shape: FeedShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends Feed>(
    this: new (shape: FeedShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeObject(json) as Record<string, JsonValue>;
    const shape: FeedShape = { ...normalized };
    const generatedPlaylists = parseOptionalJsonObjectArray(
      normalized.generatedPlaylists,
      "$.generatedPlaylists",
      (entry) => Playlist.fromJSON(entry),
    );
    const playlists = parseOptionalJsonObjectArray(normalized.playlists, "$.playlists", (entry) =>
      Playlist.fromJSON(entry));
    const days = parseOptionalJsonObjectArray(normalized.days, "$.days", parseDay);
    const events = parseOptionalJsonObjectArray(normalized.events, "$.events", (entry) =>
      normalizeObject(entry) as FeedEventShape);

    if (generatedPlaylists !== undefined) shape.generatedPlaylists = generatedPlaylists;
    if (playlists !== undefined) shape.playlists = playlists;
    if (days !== undefined) shape.days = days;
    if (events !== undefined) shape.events = events;

    return new this(shape);
  }
}

function parseDay(entry: JsonObject): FeedDayShape {
  const normalized = normalizeObject(entry) as Record<string, JsonValue>;
  const shape: FeedDayShape = { ...normalized };
  const events = parseOptionalJsonObjectArray(normalized.events, "$.days[].events", (event) =>
    normalizeObject(event) as FeedEventShape);

  if (events !== undefined) shape.events = events;

  return shape;
}
