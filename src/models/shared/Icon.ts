import type { DeepReadonly, JsonObject } from "../../core/json.ts";
import type { CoverSize } from "../../core/identifiers.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject } from "../../core/parsing.ts";
import { Cover } from "./Cover.ts";

export interface IconShape extends Record<string, unknown> {
  backgroundColor?: string;
  imageUrl?: string;
  url?: string;
  uri?: string;
}

export class Icon {
  declare readonly backgroundColor?: string;
  declare readonly imageUrl?: string;
  declare readonly url?: string;
  declare readonly uri?: string;

  constructor(shape: IconShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends Icon>(
    this: new (shape: IconShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    return new this(normalizeObject(json) as IconShape);
  }

  getUrl(size: CoverSize = "200x200"): string | null {
    const source = this.imageUrl ?? this.url ?? this.uri ?? null;

    if (source === null || source.length === 0) {
      return null;
    }

    return new Cover({ uri: source }).getUrl(size);
  }
}
