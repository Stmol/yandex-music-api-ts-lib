import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { normalizeTopLevelKeys } from "../../core/normalize.ts";

export interface StatusAccount {
  uid?: number | string;
  login?: string;
  displayName?: string;
  fullName?: string;
}

export interface StatusPermissions {
  until?: string | null;
}

export interface StatusPlus {
  hasPlus?: boolean;
  isTutorialCompleted?: boolean;
}

export interface StatusShape extends Record<string, unknown> {
  account?: StatusAccount | null;
  permissions?: StatusPermissions | null;
  plus?: StatusPlus | null;
  defaultEmail?: string | null;
}

function isJsonObject(value: JsonValue | undefined): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export class Status {
  declare readonly account?: StatusAccount | null;
  declare readonly permissions?: StatusPermissions | null;
  declare readonly plus?: StatusPlus | null;
  declare readonly defaultEmail?: string | null;

  constructor(shape: StatusShape) {
    Object.assign(this, shape);
  }

  static fromJSON<TModel extends Status>(
    this: new (shape: StatusShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeTopLevelKeys(json) as Record<string, JsonValue>;
    const shape: StatusShape = { ...normalized };

    if (isJsonObject(normalized.account)) {
      shape.account = normalizeTopLevelKeys(normalized.account) as StatusAccount;
    }

    if (isJsonObject(normalized.permissions)) {
      shape.permissions = normalizeTopLevelKeys(normalized.permissions) as StatusPermissions;
    }

    if (isJsonObject(normalized.plus)) {
      shape.plus = normalizeTopLevelKeys(normalized.plus) as StatusPlus;
    }

    return new this(shape);
  }

  get hasActiveSubscription(): boolean {
    return this.plus?.hasPlus === true || typeof this.permissions?.until === "string";
  }
}
