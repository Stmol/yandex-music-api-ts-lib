import type { HttpHeaderMap } from "../http/types.ts";

export const FORM_URLENCODED_HEADERS: HttpHeaderMap = {
  "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
};

export type FormValue = string | number | boolean;

export type FormEntries = Readonly<Record<string, FormValue | readonly FormValue[]>>;

export function createFormBody(entries: FormEntries): URLSearchParams {
  const body = new URLSearchParams();

  for (const [key, value] of Object.entries(entries)) {
    if (Array.isArray(value)) {
      for (const entry of value) {
        body.append(key, String(entry));
      }

      continue;
    }

    body.set(key, String(value));
  }

  return body;
}
