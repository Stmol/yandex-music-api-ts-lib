import type { HttpHeaderMap, HttpMethod } from "./types.ts";

const SENSITIVE_HEADERS = new Set([
  "authorization",
  "cookie",
  "proxy-authorization",
  "set-cookie",
  "x-oauth-token",
]);

const REDACTED_HEADER_VALUE = "[REDACTED]";

export interface HttpLogEventBase {
  readonly attempt: number;
  readonly hasRequestBody: boolean;
  readonly headers: HttpHeaderMap;
  readonly method: HttpMethod;
  readonly requestId: string;
  readonly startedAt: string;
  readonly url: string;
}

export type HttpRequestLogEvent = HttpLogEventBase;

export interface HttpResponseLogEvent extends HttpLogEventBase {
  readonly durationMs: number;
  readonly hasResponseBody: boolean;
  readonly status: number;
  readonly statusText: string;
  readonly willRetry: boolean;
}

export interface HttpErrorLogEvent extends HttpLogEventBase {
  readonly durationMs: number;
  readonly error: unknown;
  readonly willRetry: boolean;
}

export interface HttpLogger {
  onError?(event: HttpErrorLogEvent): void;
  onRequest?(event: HttpRequestLogEvent): void;
  onResponse?(event: HttpResponseLogEvent): void;
}

export interface ConsoleHttpLoggerOptions {
  readonly console?: Pick<Console, "error" | "info">;
}

function toLogPayload(event: HttpRequestLogEvent | HttpResponseLogEvent | HttpErrorLogEvent): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    attempt: event.attempt,
    hasRequestBody: event.hasRequestBody,
    headers: event.headers,
    method: event.method,
    requestId: event.requestId,
    startedAt: event.startedAt,
    url: event.url,
  };

  if ("durationMs" in event) {
    payload.durationMs = event.durationMs;
  }

  if ("error" in event) {
    payload.error = event.error;
    payload.willRetry = event.willRetry;
  }

  if ("hasResponseBody" in event) {
    payload.hasResponseBody = event.hasResponseBody;
    payload.status = event.status;
    payload.statusText = event.statusText;
    payload.willRetry = event.willRetry;
  }

  return payload;
}

export function createConsoleHttpLogger(options: ConsoleHttpLoggerOptions = {}): HttpLogger {
  const targetConsole = options.console ?? console;

  return {
    onError(event) {
      targetConsole.error("HTTP error", toLogPayload(event));
    },
    onRequest(event) {
      targetConsole.info("HTTP request", toLogPayload(event));
    },
    onResponse(event) {
      targetConsole.info("HTTP response", toLogPayload(event));
    },
  };
}

export function redactSensitiveHeaders(headers: HttpHeaderMap): HttpHeaderMap {
  return Object.freeze(
    Object.fromEntries(
      Object.entries(headers).map(([key, value]) => [
        key,
        SENSITIVE_HEADERS.has(key.toLowerCase()) ? REDACTED_HEADER_VALUE : value,
      ]),
    ) as Record<string, string>,
  );
}
