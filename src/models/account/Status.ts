import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject, parseOptionalJsonObject } from "../../core/parsing.ts";
import { Permissions } from "./Permissions.ts";
import { Plus } from "./Plus.ts";

export interface StatusAccount {
  uid?: number | string;
  login?: string;
  displayName?: string;
  fullName?: string;
}

export interface StatusShape extends Record<string, unknown> {
  account?: StatusAccount | null;
  permissions?: Permissions | null;
  plus?: Plus | null;
  defaultEmail?: string | null;
}

export class Status {
  declare readonly account?: StatusAccount | null;
  declare readonly permissions?: Permissions | null;
  declare readonly plus?: Plus | null;
  declare readonly defaultEmail?: string | null;

  constructor(shape: StatusShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends Status>(
    this: new (shape: StatusShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeObject(json) as Record<string, JsonValue>;
    const shape: StatusShape = { ...normalized };
    const account = parseOptionalJsonObject(normalized.account, "$.account", (entry) =>
      normalizeObject(entry) as StatusAccount);
    const permissions = parseOptionalJsonObject(normalized.permissions, "$.permissions", (entry) =>
      Permissions.fromJSON(entry));
    const plus = parseOptionalJsonObject(normalized.plus, "$.plus", (entry) =>
      Plus.fromJSON(entry));

    if (account !== undefined) shape.account = account;
    if (permissions !== undefined) shape.permissions = permissions;
    if (plus !== undefined) shape.plus = plus;

    return new this(shape);
  }

  get hasActiveSubscription(): boolean {
    if (this.plus?.hasPlus === true) {
      return true;
    }

    if (typeof this.permissions?.until !== "string") {
      return false;
    }

    const expiresAt = Date.parse(this.permissions.until);

    return Number.isFinite(expiresAt) && expiresAt > Date.now();
  }
}
