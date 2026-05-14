import { expectJsonArray, expectJsonObject, parseJsonObjectArray } from "../core/parsing.ts";
import type { JsonObject, JsonValue } from "../core/json.ts";
import type { HttpResponse } from "../http/types.ts";
import { parseYandexApiResponse } from "../http/response.ts";

function contextFromResponse(response: HttpResponse): { readonly status: number; readonly url: string } {
  return {
    status: response.status,
    url: response.url,
  };
}

export function parseObjectResult(response: HttpResponse): JsonObject {
  return expectJsonObject(parseYandexApiResponse<unknown>(response), "$.result", contextFromResponse(response));
}

export function parseArrayResult(response: HttpResponse): readonly JsonValue[] {
  return expectJsonArray(parseYandexApiResponse<unknown>(response), "$.result", contextFromResponse(response));
}

export function parseObjectArrayResult<TItem>(
  response: HttpResponse,
  parseItem: (item: JsonObject, path: string) => TItem,
): readonly TItem[] {
  return parseJsonObjectArray(
    parseYandexApiResponse<unknown>(response),
    "$.result",
    parseItem,
    contextFromResponse(response),
  );
}
