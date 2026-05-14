export type JsonPrimitive = string | number | boolean | null;

export type JsonValue = JsonPrimitive | JsonObject | JsonArray;

export interface JsonObject {
  readonly [key: string]: JsonValue;
}

export type JsonArray = readonly JsonValue[];

export type DeepReadonly<T> = T extends JsonPrimitive
  ? T
  : T extends (...args: never[]) => unknown
    ? T
    : T extends readonly [unknown, ...unknown[]]
      ? { readonly [TKey in keyof T]: DeepReadonly<T[TKey]> }
      : T extends ReadonlyArray<infer TValue>
        ? ReadonlyArray<DeepReadonly<TValue>>
        : T extends object
          ? { readonly [TKey in keyof T]: DeepReadonly<T[TKey]> }
          : T;
