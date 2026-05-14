import {
  DEFAULT_RETRY_BASE_DELAY_MS,
  DEFAULT_RETRY_MAX_DELAY_MS,
  DEFAULT_RETRY_MAX_RETRIES,
  DEFAULT_RETRY_METHODS,
  DEFAULT_RETRY_STATUSES,
  DEFAULT_HEADERS,
  DEFAULT_TIMEOUT_MS,
  YANDEX_MUSIC_API_BASE_URL,
} from "./constants.ts";
import { AbortError, NetworkError, TimeoutError, UnknownApiError } from "../core/errors.ts";
import type {
  FetchLike,
  HttpHeaderMap,
  HttpQueryParams,
  HttpRequest,
  HttpRetryPolicy,
  HttpResponse,
  HttpTransport,
} from "./types.ts";

export interface FetchTransportOptions {
  readonly baseUrl?: string;
  readonly defaultHeaders?: HttpHeaderMap;
  readonly defaultRetry?: HttpRetryPolicy;
  readonly defaultTimeoutMs?: number;
  readonly fetch?: FetchLike;
  readonly oauthToken?: string;
}

interface ResolvedRetryPolicy {
  readonly baseDelayMs: number;
  readonly maxDelayMs: number;
  readonly maxRetries: number;
  readonly retryOnMethods: readonly string[];
  readonly retryOnStatuses: readonly number[];
}

function joinUrl(baseUrl: string, path: string): string {
  return new URL(path.replace(/^\//u, ""), `${baseUrl.replace(/\/+$/u, "")}/`).toString();
}

function setHeader(headers: Headers, key: string, value: string): void {
  headers.set(key, value);
}

function hasHeader(headers: Headers, key: string): boolean {
  return headers.has(key);
}

function appendQuery(url: URL, query: HttpQueryParams | undefined): void {
  if (!query) {
    return;
  }

  for (const [key, value] of Object.entries(query)) {
    if (Array.isArray(value)) {
      for (const entry of value) {
        if (entry !== null && entry !== undefined) {
          url.searchParams.append(key, String(entry));
        }
      }

      continue;
    }

    if (value !== null && value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  }
}

function createAbortSignal(
  timeoutMs: number,
  externalSignal: AbortSignal | undefined,
): {
  readonly clear: () => void;
  readonly didTimeout: () => boolean;
  readonly wasAbortedExternally: () => boolean;
  readonly signal: AbortSignal;
} {
  const controller = new AbortController();
  let abortedExternally = false;
  let timedOut = false;

  const abortFromExternalSignal = (): void => {
    abortedExternally = true;
    controller.abort(externalSignal?.reason);
  };

  if (externalSignal) {
    if (externalSignal.aborted) {
      abortedExternally = true;
      controller.abort(externalSignal.reason);
    } else {
      externalSignal.addEventListener("abort", abortFromExternalSignal, { once: true });
    }
  }

  const timeoutId = setTimeout(() => {
    timedOut = true;
    controller.abort(new Error(`Request timed out after ${timeoutMs} ms.`));
  }, timeoutMs);

  const clear = (): void => {
    clearTimeout(timeoutId);
    externalSignal?.removeEventListener("abort", abortFromExternalSignal);
  };

  return {
    clear,
    didTimeout: () => timedOut,
    signal: controller.signal,
    wasAbortedExternally: () => abortedExternally,
  };
}

function resolveRetryPolicy(
  defaultRetry: HttpRetryPolicy | undefined,
  requestRetry: HttpRetryPolicy | undefined,
): ResolvedRetryPolicy {
  return {
    baseDelayMs: requestRetry?.baseDelayMs ?? defaultRetry?.baseDelayMs ?? DEFAULT_RETRY_BASE_DELAY_MS,
    maxDelayMs: requestRetry?.maxDelayMs ?? defaultRetry?.maxDelayMs ?? DEFAULT_RETRY_MAX_DELAY_MS,
    maxRetries: requestRetry?.maxRetries ?? defaultRetry?.maxRetries ?? DEFAULT_RETRY_MAX_RETRIES,
    retryOnMethods: requestRetry?.retryOnMethods ?? defaultRetry?.retryOnMethods ?? DEFAULT_RETRY_METHODS,
    retryOnStatuses: requestRetry?.retryOnStatuses ?? defaultRetry?.retryOnStatuses ?? DEFAULT_RETRY_STATUSES,
  };
}

function shouldRetryMethod(method: string, retryPolicy: ResolvedRetryPolicy): boolean {
  return retryPolicy.retryOnMethods.includes(method);
}

function shouldRetryAttempt(attempt: number, retryPolicy: ResolvedRetryPolicy): boolean {
  return attempt < retryPolicy.maxRetries;
}

function isAbortErrorLike(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

function getRetryDelayMs(
  attempt: number,
  retryPolicy: ResolvedRetryPolicy,
  response: Response | undefined,
): number {
  const retryAfterHeader = response?.headers.get("retry-after");

  if (retryAfterHeader) {
    const parsedSeconds = Number.parseInt(retryAfterHeader, 10);

    if (Number.isFinite(parsedSeconds) && parsedSeconds >= 0) {
      return Math.min(parsedSeconds * 1_000, retryPolicy.maxDelayMs);
    }

    const parsedDate = Date.parse(retryAfterHeader);

    if (!Number.isNaN(parsedDate)) {
      return Math.min(Math.max(parsedDate - Date.now(), 0), retryPolicy.maxDelayMs);
    }
  }

  return Math.min(retryPolicy.baseDelayMs * (2 ** attempt), retryPolicy.maxDelayMs);
}

async function waitForRetry(delayMs: number, signal: AbortSignal | undefined): Promise<void> {
  if (delayMs <= 0) {
    return;
  }

  await new Promise<void>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      signal?.removeEventListener("abort", abortListener);
      resolve();
    }, delayMs);

    const abortListener = (): void => {
      clearTimeout(timeoutId);
      reject(
        signal?.reason instanceof Error
          ? signal.reason
          : new DOMException("The operation was aborted.", "AbortError"),
      );
    };

    if (signal?.aborted) {
      abortListener();
      return;
    }

    signal?.addEventListener("abort", abortListener, { once: true });
  });
}

function shouldRetryResponse(
  method: string,
  response: Response,
  retryPolicy: ResolvedRetryPolicy,
  attempt: number,
): boolean {
  return shouldRetryMethod(method, retryPolicy)
    && shouldRetryAttempt(attempt, retryPolicy)
    && retryPolicy.retryOnStatuses.includes(response.status);
}

function resolveRequestUrl(baseUrl: string, request: HttpRequest): URL {
  const path = (request as { readonly path?: unknown }).path;
  const url = (request as { readonly url?: unknown }).url;
  const hasPath = path !== undefined;
  const hasUrl = url !== undefined;

  if (hasPath === hasUrl) {
    throw new TypeError("HttpRequest must include exactly one of path or url.");
  }

  if (hasPath) {
    if (typeof path !== "string") {
      throw new TypeError("HttpRequest path must be a string.");
    }

    return new URL(joinUrl(baseUrl, path));
  }

  if (typeof url !== "string") {
    throw new TypeError("HttpRequest url must be a string.");
  }

  return new URL(url);
}

async function discardResponseBody(response: Response): Promise<void> {
  try {
    await response.body?.cancel();
  } catch {
    // Ignore cleanup failures so retry behavior is driven by the original response status.
  }
}

async function readResponseBody(response: Response): Promise<HttpResponse["body"]> {
  if (response.status === 204 || response.status === 205) {
    return null;
  }

  const text = await response.text();

  if (text.length === 0) {
    return null;
  }

  const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";

  if (contentType.includes("application/json")) {
    try {
      return JSON.parse(text) as HttpResponse["body"];
    } catch (cause) {
      throw new UnknownApiError("Failed to parse Yandex Music API JSON response.", {
        cause,
        details: text,
        status: response.status,
        url: response.url,
      });
    }
  }

  return text;
}

function toHeaderMap(headers: Headers): HttpHeaderMap {
  return Object.freeze(
    Object.fromEntries(headers.entries()) as Record<string, string>,
  );
}

export class FetchTransport implements HttpTransport {
  readonly #baseUrl: string;
  readonly #defaultHeaders: HttpHeaderMap;
  readonly #defaultRetry: HttpRetryPolicy | undefined;
  readonly #defaultTimeoutMs: number;
  readonly #fetch: FetchLike;
  readonly #oauthToken: string | undefined;

  constructor(options: FetchTransportOptions = {}) {
    this.#baseUrl = options.baseUrl ?? YANDEX_MUSIC_API_BASE_URL;
    this.#defaultHeaders = options.defaultHeaders ?? DEFAULT_HEADERS;
    this.#defaultRetry = options.defaultRetry;
    this.#defaultTimeoutMs = options.defaultTimeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.#fetch = options.fetch ?? fetch;
    this.#oauthToken = options.oauthToken;
  }

  async request(request: HttpRequest): Promise<HttpResponse> {
    const method = request.method ?? "GET";
    const retryPolicy = resolveRetryPolicy(this.#defaultRetry, request.retry);
    const timeoutMs = request.timeoutMs ?? this.#defaultTimeoutMs;
    const url = resolveRequestUrl(this.#baseUrl, request);

    appendQuery(url, request.query);

    const headers = new Headers(this.#defaultHeaders);

    if (request.headers) {
      for (const [key, value] of Object.entries(request.headers)) {
        setHeader(headers, key, value);
      }
    }

    const oauthToken = request.oauthToken ?? this.#oauthToken;

    if (oauthToken && !hasHeader(headers, "authorization")) {
      setHeader(headers, "Authorization", `OAuth ${oauthToken}`);
    }

    for (let attempt = 0; ; attempt += 1) {
      const abort = createAbortSignal(timeoutMs, request.signal);

      try {
        const init: RequestInit = {
          headers,
          method,
          signal: abort.signal,
        };

        if (request.body !== undefined) {
          init.body = request.body;
        }

        const response = await this.#fetch(url, init);

        if (shouldRetryResponse(method, response, retryPolicy, attempt)) {
          await discardResponseBody(response);
          await waitForRetry(getRetryDelayMs(attempt, retryPolicy, response), request.signal);
          continue;
        }

        const body = await readResponseBody(response);

        return {
          body,
          headers: toHeaderMap(response.headers),
          status: response.status,
          statusText: response.statusText,
          url: response.url,
        };
      } catch (cause) {
        if (abort.didTimeout()) {
          if (shouldRetryMethod(method, retryPolicy) && shouldRetryAttempt(attempt, retryPolicy)) {
            await waitForRetry(getRetryDelayMs(attempt, retryPolicy, undefined), request.signal);
            continue;
          }

          throw new TimeoutError(`Request timed out after ${timeoutMs} ms.`, {
            cause,
            url: url.toString(),
          });
        }

        if (abort.wasAbortedExternally() || (request.signal?.aborted && isAbortErrorLike(cause))) {
          throw new AbortError("Yandex Music API request was aborted.", {
            cause,
            url: url.toString(),
          });
        }

        if (cause instanceof UnknownApiError) {
          throw cause;
        }

        if (shouldRetryMethod(method, retryPolicy) && shouldRetryAttempt(attempt, retryPolicy)) {
          await waitForRetry(getRetryDelayMs(attempt, retryPolicy, undefined), request.signal);
          continue;
        }

        throw new NetworkError("Yandex Music API request failed.", {
          cause,
          url: url.toString(),
        });
      } finally {
        abort.clear();
      }
    }
  }
}
