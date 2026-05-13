import type { DeepReadonly, JsonObject } from "../../core/json.ts";
import { normalizeTopLevelKeys } from "../../core/normalize.ts";

export interface CoverShape extends Record<string, unknown> {
  uri?: string | null;
  itemsUri?: string | null;
  dir?: string | null;
  version?: string | null;
  type?: string | null;
  custom?: boolean;
}

export class Cover {
  declare readonly uri?: string | null;
  declare readonly itemsUri?: string | null;
  declare readonly dir?: string | null;
  declare readonly version?: string | null;
  declare readonly type?: string | null;
  declare readonly custom?: boolean;

  constructor(shape: CoverShape) {
    Object.assign(this, shape);
  }

  static fromJSON<TModel extends Cover>(
    this: new (shape: CoverShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    return new this(normalizeTopLevelKeys(json) as CoverShape);
  }

  getUrl(size = "200x200"): string | null {
    const source = this.uri ?? this.itemsUri ?? null;

    if (source === null || source.length === 0) {
      return null;
    }

    const normalizedSource = source.startsWith("http://") || source.startsWith("https://")
      ? source
      : source.startsWith("//")
        ? `https:${source}`
        : `https://${source}`;

    return normalizedSource.includes("%%")
      ? normalizedSource.replace("%%", size)
      : normalizedSource;
  }
}
