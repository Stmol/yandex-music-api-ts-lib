import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject, parseOptionalJsonObject, parseOptionalJsonObjectArray } from "../../core/parsing.ts";
import { MetatagTitle } from "./MetatagTitle.ts";

export interface MetatagTreeShape extends Record<string, unknown> {
  id?: string | number;
  title?: string | MetatagTitle | null;
  children?: readonly MetatagTree[];
}

export class MetatagTree {
  declare readonly id?: string | number;
  declare readonly title?: string | MetatagTitle | null;
  declare readonly children?: readonly MetatagTree[];

  constructor(shape: MetatagTreeShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends MetatagTree>(
    this: new (shape: MetatagTreeShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeObject(json) as Record<string, JsonValue>;
    const shape: MetatagTreeShape = { ...normalized };
    const title = parseOptionalJsonObject(normalized.title, "$.title", (entry) =>
      MetatagTitle.fromJSON(entry));
    const children = parseOptionalJsonObjectArray(normalized.children, "$.children", (entry) =>
      MetatagTree.fromJSON(entry));

    if (title !== undefined) shape.title = title;
    if (children !== undefined) shape.children = children;

    return new this(shape);
  }
}
