import type { DeepReadonly, JsonObject } from "../../core/json.ts";
import { normalizeTopLevelKeys } from "../../core/normalize.ts";

export interface TrackShortShape extends Record<string, unknown> {
  id?: string | number;
  realId?: string | number;
  title?: string;
  version?: string | null;
  durationMs?: number;
  available?: boolean;
  coverUri?: string | null;
  contentWarning?: string | null;
}

export class TrackShort {
  declare readonly id?: string | number;
  declare readonly realId?: string | number;
  declare readonly title?: string;
  declare readonly version?: string | null;
  declare readonly durationMs?: number;
  declare readonly available?: boolean;
  declare readonly coverUri?: string | null;
  declare readonly contentWarning?: string | null;

  constructor(shape: TrackShortShape) {
    Object.assign(this, shape);
  }

  static fromJSON<TModel extends TrackShort>(
    this: new (shape: TrackShortShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    return new this(normalizeTopLevelKeys(json) as TrackShortShape);
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
}
