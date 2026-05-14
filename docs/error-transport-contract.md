# Error And Transport Contract

This document defines the behavioral contract for the built-in HTTP layer and the public error surface.

## Request Shape

`HttpRequest` must provide exactly one of:

- `path`
- `url`

If both or neither are provided, the built-in transport throws `TypeError` before dispatch.

## URL Resolution

- `path` is resolved against `https://api.music.yandex.net`
- leading and trailing slashes are normalized during URL join
- `url` is used as-is
- `query` values are appended after URL resolution

Query encoding rules:

- scalar values are stringified
- `null` and `undefined` are skipped
- arrays append repeated query parameters for each non-null value

## Headers And Authentication

The built-in transport:

- sends `Accept: application/json` by default
- merges `defaultHeaders` first, then per-request `headers`
- injects `Authorization: OAuth <token>` only when a token is available and the request did not already set `authorization`

Token sources, in precedence order:

1. `request.oauthToken`
2. client-level `oauthToken`

## Timeout And Cancellation

- default timeout: `10_000 ms`
- per-request `timeoutMs` overrides the client default
- external `AbortSignal` is supported

Failure mapping:

- timeout expiry becomes `TimeoutError`
- caller-driven cancellation becomes `AbortError`

Timeouts and aborts are not retried.

## Retry Policy

Default retry policy for `FetchTransport`:

- methods: `GET`
- statuses: `408`, `425`, `429`, `500`, `502`, `503`, `504`
- `maxRetries`: `2`
- `baseDelayMs`: `250`
- `maxDelayMs`: `2000`

Behavior:

- retries apply only when the method is in `retryOnMethods`
- `Retry-After` is honored when present
- exponential backoff is used when `Retry-After` is absent
- retriable response bodies are discarded before a retry attempt
- network failures may retry only when the method is retriable
- malformed JSON responses are not retried
- non-idempotent requests are not retried by default

## Response Parsing

Response body behavior:

- `204` and `205` return `null`
- empty body returns `null`
- `content-type` containing `application/json` is parsed as JSON
- any other content type is returned as plain text

If JSON parsing fails, the transport throws `UnknownApiError` with:

- `details`: original response text
- `status`: HTTP status when available
- `url`: response URL when available

## API Envelope Handling

`parseYandexApiResponse(...)` applies these rules:

- any `status >= 400` throws a typed error
- JSON bodies with an `error` field also throw, even when the status is success-like
- JSON bodies with a `result` field unwrap and return `result`
- other successful JSON bodies return as-is
- non-object successful bodies return as-is

## Error Mapping

Public typed errors:

- `YandexMusicError`
- `BadRequestError`
- `UnauthorizedError`
- `NotFoundError`
- `UnknownApiError`
- `ApiSchemaError`
- `NetworkError`
- `TimeoutError`
- `AbortError`

HTTP mapping:

- `400` or API error names `bad-request` / `bad_request` -> `BadRequestError`
- `401`, `403`, `unauthorized`, or `forbidden` -> `UnauthorizedError`
- `404` or API error names `not-found` / `not_found` -> `NotFoundError`
- everything else -> `UnknownApiError`

Non-HTTP mapping:

- fetch/network failure before a response -> `NetworkError`
- timeout -> `TimeoutError`
- external cancellation -> `AbortError`

## Error Fields

All `YandexMusicError` subclasses may contain:

- `cause`
- `details`
- `status`
- `url`

`ApiSchemaError` additionally includes:

- `expected`
- `path`
- `received`

Consumers should treat unknown API payload changes and schema mismatches as operational failures, not as signals that undocumented fields are stable.
