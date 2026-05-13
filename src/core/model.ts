import type { DeepReadonly, JsonObject } from "./json.ts";
import { normalizeTopLevelKeys } from "./normalize.ts";

export abstract class YandexMusicModel<
  TShape extends Record<string, unknown>,
  TJSON extends JsonObject = JsonObject,
> {
  constructor(shape: TShape) {
    Object.assign(this, shape);
  }

  static fromJSON<
    TShape extends Record<string, unknown>,
    TJSON extends JsonObject,
    TModel extends YandexMusicModel<TShape, TJSON>,
  >(
    this: new (shape: TShape) => TModel,
    json: DeepReadonly<TJSON>,
  ): TModel {
    return new this(normalizeTopLevelKeys(json) as unknown as TShape);
  }
}
