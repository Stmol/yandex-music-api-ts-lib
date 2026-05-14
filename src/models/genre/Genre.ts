import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject, parseOptionalJsonObject } from "../../core/parsing.ts";

export interface GenreTitleShape extends Record<string, unknown> {
  title?: string;
  fullTitle?: string;
}

export interface GenreImagesShape extends Record<string, unknown> {
  image?: string;
  background?: string;
  cover?: string;
}

export interface GenreShape extends Record<string, unknown> {
  id?: string;
  title?: string | GenreTitleShape | null;
  weight?: number;
  composerTop?: boolean;
  images?: GenreImagesShape | null;
}

export class Genre {
  declare readonly id?: string;
  declare readonly title?: string | GenreTitleShape | null;
  declare readonly weight?: number;
  declare readonly composerTop?: boolean;
  declare readonly images?: GenreImagesShape | null;

  constructor(shape: GenreShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends Genre>(
    this: new (shape: GenreShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeObject(json) as Record<string, JsonValue>;
    const shape: GenreShape = { ...normalized };
    const images = parseOptionalJsonObject(normalized.images, "$.images", (entry) =>
      normalizeObject(entry) as GenreImagesShape);

    if (typeof normalized.title === "string") {
      shape.title = normalized.title;
    } else {
      const title = parseOptionalJsonObject(normalized.title, "$.title", (entry) =>
        normalizeObject(entry) as GenreTitleShape);

      if (title !== undefined) {
        shape.title = title;
      }
    }

    if (images !== undefined) shape.images = images;

    return new this(shape);
  }
}
