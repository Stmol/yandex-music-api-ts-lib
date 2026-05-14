import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject, parseOptionalJsonObjectArray } from "../../core/parsing.ts";
import { Concert } from "./Concert.ts";

export interface ArtistConcertsShape extends Record<string, unknown> {
  concerts?: readonly Concert[];
}

export class ArtistConcerts {
  declare readonly concerts?: readonly Concert[];

  constructor(shape: ArtistConcertsShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends ArtistConcerts>(
    this: new (shape: ArtistConcertsShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeObject(json) as Record<string, JsonValue>;
    const shape: ArtistConcertsShape = { ...normalized };
    const concerts = parseOptionalJsonObjectArray(normalized.concerts, "$.concerts", (entry) =>
      Concert.fromJSON(entry));

    if (concerts !== undefined) shape.concerts = concerts;

    return new this(shape);
  }
}
