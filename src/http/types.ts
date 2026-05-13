import type { JsonValue } from "../core/json.ts";

export type SupportedLanguage = "ru" | "en" | "uk" | "kk" | "be";

export type HttpMethod = "DELETE" | "GET" | "PATCH" | "POST" | "PUT";

export type HttpHeaderMap = Readonly<Record<string, string>>;

export type HttpQueryValue = string | number | boolean | null | undefined;

export type HttpQueryParams = Readonly<
  Record<string, HttpQueryValue | readonly HttpQueryValue[]>
>;

export type HttpResponseBody = JsonValue | string | null;

export interface HttpRetryPolicy {
  readonly baseDelayMs?: number;
  readonly maxDelayMs?: number;
  readonly maxRetries?: number;
  readonly retryOnMethods?: readonly HttpMethod[];
  readonly retryOnStatuses?: readonly number[];
}

export interface HttpRequest {
  readonly body?: BodyInit | null;
  readonly headers?: HttpHeaderMap;
  readonly method?: HttpMethod;
  readonly oauthToken?: string;
  readonly path?: string;
  readonly query?: HttpQueryParams;
  readonly retry?: HttpRetryPolicy;
  readonly signal?: AbortSignal;
  readonly timeoutMs?: number;
  readonly url?: string;
}

export interface HttpResponse {
  readonly body: HttpResponseBody;
  readonly headers: HttpHeaderMap;
  readonly status: number;
  readonly statusText: string;
  readonly url: string;
}

export interface HttpTransport {
  request(request: HttpRequest): Promise<HttpResponse>;
}

export interface FetchLike {
  (input: URL | RequestInfo, init?: RequestInit): Promise<Response>;
}
