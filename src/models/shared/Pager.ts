import type { DeepReadonly, JsonObject } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject } from "../../core/parsing.ts";

export interface PagerShape<TItem = unknown> extends Record<string, unknown> {
  page?: number;
  perPage?: number;
  total?: number;
  count?: number;
  items?: readonly TItem[];
}

export class Pager<TItem = unknown> {
  declare readonly page?: number;
  declare readonly perPage?: number;
  declare readonly total?: number;
  declare readonly count?: number;
  declare readonly items?: readonly TItem[];

  constructor(shape: PagerShape<TItem>) {
    assignModelShape(this, shape);
  }

  static fromJSON<TItem, TModel extends Pager<TItem>>(
    this: new (shape: PagerShape<TItem>) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    return new this(normalizeObject(json));
  }

  get hasNextPage(): boolean {
    if (
      typeof this.page !== "number" ||
      typeof this.perPage !== "number" ||
      typeof this.total !== "number"
    ) {
      return false;
    }

    return this.page * this.perPage < this.total;
  }
}
