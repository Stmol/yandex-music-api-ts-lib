import type { DeepReadonly, JsonObject } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject } from "../../core/parsing.ts";

export interface CaseFormsShape extends Record<string, unknown> {
  nominative?: string;
  genitive?: string;
  dative?: string;
  accusative?: string;
  instrumental?: string;
  prepositional?: string;
}

export class CaseForms {
  declare readonly nominative?: string;
  declare readonly genitive?: string;
  declare readonly dative?: string;
  declare readonly accusative?: string;
  declare readonly instrumental?: string;
  declare readonly prepositional?: string;

  constructor(shape: CaseFormsShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends CaseForms>(
    this: new (shape: CaseFormsShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    return new this(normalizeObject(json));
  }
}
