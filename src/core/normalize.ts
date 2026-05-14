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
  const trimmed = key.trim();

  if (!/[-_\s]/.test(trimmed)) {
    return trimmed.charAt(0).toLowerCase() + trimmed.slice(1);
  }

  const [head, ...tail] = trimmed.split(/[-_\s]+/);

  return [
    head?.toLowerCase() ?? "",
    ...tail.map((part) => {
      const normalized = part.toLowerCase();

      return normalized.charAt(0).toUpperCase() + normalized.slice(1);
    }),
  ].join("");
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
