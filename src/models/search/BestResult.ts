import type { JsonValue } from "../../core/json.ts";
import { expectJsonObject, normalizeObject } from "../../core/parsing.ts";
import { Album } from "../album/Album.ts";
import { Artist } from "../artist/Artist.ts";
import { Playlist } from "../playlist/Playlist.ts";
import { Track } from "../track/Track.ts";
import type { SearchBestResultShape } from "./Search.ts";

export function parseSearchBestResult(value: JsonValue | undefined): SearchBestResultShape | null | undefined {
  if (value === undefined || value === null) {
    return value;
  }

  const normalized = normalizeObject(expectJsonObject(value, "$.best")) as Record<string, JsonValue>;
  const shape: SearchBestResultShape = {};

  if (typeof normalized.type === "string") {
    shape.type = normalized.type;
  }

  if (typeof normalized.text === "string") {
    shape.text = normalized.text;
  }

  if (normalized.result === undefined || normalized.result === null) {
    if (normalized.result === null) {
      shape.result = null;
    }

    return shape;
  }

  switch (normalized.type) {
    case "artist": {
      const result = expectJsonObject(normalized.result, "$.best.result");
      shape.result = Artist.fromJSON(result);
      break;
    }
    case "album": {
      const result = expectJsonObject(normalized.result, "$.best.result");
      shape.result = Album.fromJSON(result);
      break;
    }
    case "track": {
      const result = expectJsonObject(normalized.result, "$.best.result");
      shape.result = Track.fromJSON(result);
      break;
    }
    case "playlist": {
      const result = expectJsonObject(normalized.result, "$.best.result");
      shape.result = Playlist.fromJSON(result);
      break;
    }
    default:
      shape.result = null;
      break;
  }

  return shape;
}
