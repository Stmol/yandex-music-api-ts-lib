import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
  UnknownApiError,
} from "../core/errors.ts";
import type { JsonObject, JsonValue } from "../core/json.ts";
import type { HttpResponse } from "./types.ts";

interface ApiErrorShape extends JsonObject {
  readonly description?: JsonValue;
  readonly error_name?: JsonValue;
  readonly message?: JsonValue;
  readonly name?: JsonValue;
}

interface ApiEnvelope<TValue> {
  readonly invocationInfo?: JsonValue;
  readonly result?: TValue;
}

function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getString(value: JsonValue | undefined): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function normalizeApiErrorName(value: JsonValue | undefined): string | undefined {
  const stringValue = getString(value);

  return stringValue?.trim().toLowerCase();
}

function getApiErrorName(body: JsonObject): string | undefined {
  const errorValue = body.error;

  if (typeof errorValue === "string") {
    return normalizeApiErrorName(errorValue);
  }

  if (isJsonObject(errorValue)) {
    return (
      normalizeApiErrorName(errorValue.name) ??
      normalizeApiErrorName(errorValue.error_name) ??
      normalizeApiErrorName(errorValue.error)
    );
  }

  return undefined;
}

function getApiErrorMessage(body: JsonObject): string {
  const errorValue = body.error;
  const topLevelMessage = getString(body.message) ?? getString(body.description);

  if (typeof errorValue === "string") {
    return topLevelMessage ?? errorValue;
  }

  if (isJsonObject(errorValue)) {
    const nestedError = errorValue as ApiErrorShape;

    return (
      getString(nestedError.message) ??
      getString(nestedError.description) ??
      getString(nestedError.name) ??
      getString(nestedError.error_name) ??
      topLevelMessage ??
      "Yandex Music API request failed."
    );
  }

  return topLevelMessage ?? "Yandex Music API request failed.";
}

function createApiError(response: HttpResponse, body: JsonObject): Error {
  const name = getApiErrorName(body);
  const message = getApiErrorMessage(body);
  const options = {
    details: body,
    status: response.status,
    url: response.url,
  };

  if (response.status === 400 || name === "bad-request" || name === "bad_request") {
    return new BadRequestError(message, options);
  }

  if (
    response.status === 401 ||
    response.status === 403 ||
    name === "unauthorized" ||
    name === "forbidden"
  ) {
    return new UnauthorizedError(message, options);
  }

  if (response.status === 404 || name === "not-found" || name === "not_found") {
    return new NotFoundError(message, options);
  }

  return new UnknownApiError(message, options);
}

export function parseYandexApiResponse<TValue>(response: HttpResponse): TValue {
  const { body } = response;

  if (response.status >= 400) {
    if (isJsonObject(body)) {
      throw createApiError(response, body);
    }

    const message =
      body === null
        ? response.statusText || "Yandex Music API request failed."
        : typeof body === "string"
          ? body
          : JSON.stringify(body);

    if (response.status === 400) {
      throw new BadRequestError(message, {
        details: body,
        status: response.status,
        url: response.url,
      });
    }

    if (response.status === 401 || response.status === 403) {
      throw new UnauthorizedError(message, {
        details: body,
        status: response.status,
        url: response.url,
      });
    }

    if (response.status === 404) {
      throw new NotFoundError(message, {
        details: body,
        status: response.status,
        url: response.url,
      });
    }

    throw new UnknownApiError(message, {
      details: body,
      status: response.status,
      url: response.url,
    });
  }

  if (!isJsonObject(body)) {
    return body as TValue;
  }

  if ("error" in body && body.error !== undefined && body.error !== null) {
    throw createApiError(response, body);
  }

  if ("result" in body) {
    return (body as ApiEnvelope<TValue>).result as TValue;
  }

  return body as TValue;
}
