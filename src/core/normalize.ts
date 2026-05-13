import type { JsonObject } from "./json.ts";

type Separator = "_" | "-" | " ";

type NormalizeKeyPart<TValue extends string> =
  TValue extends `${infer THead}${Separator}${infer TTail}`
    ? `${Lowercase<THead>}${Capitalize<NormalizeKeyPart<TTail>>}`
    : Lowercase<TValue>;

export type NormalizeTopLevelKey<TKey> = TKey extends string ? NormalizeKeyPart<TKey> : TKey;

export type NormalizeTopLevelKeys<TValue> = TValue extends readonly unknown[]
  ? TValue
  : TValue extends object
    ? {
        [TKey in keyof TValue as NormalizeTopLevelKey<TKey>]: TValue[TKey];
      }
    : TValue;

export function normalizeTopLevelKey(key: string): string {
  return key
    .trim()
    .replace(/[-_\s]+([a-zA-Z0-9])/g, (_, value: string) => value.toUpperCase())
    .replace(/^[A-Z]/, (value) => value.toLowerCase());
}

export function normalizeTopLevelKeys<TValue extends JsonObject>(
  value: TValue,
): NormalizeTopLevelKeys<TValue> {
  const normalizedEntries = Object.entries(value).map(([key, entryValue]) => [
    normalizeTopLevelKey(key),
    entryValue,
  ]);

  return Object.fromEntries(normalizedEntries) as NormalizeTopLevelKeys<TValue>;
}
