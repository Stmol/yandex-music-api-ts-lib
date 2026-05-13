import assert from "node:assert/strict";
import test from "node:test";

import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
  UnknownApiError,
} from "../../src/core/errors.ts";
import { parseYandexApiResponse } from "../../src/http/response.ts";
import type { HttpResponse } from "../../src/http/types.ts";

function createResponse(body: HttpResponse["body"], status = 200): HttpResponse {
  return {
    body,
    headers: {},
    status,
    statusText: status === 200 ? "OK" : "Error",
    url: "https://api.music.yandex.net/test",
  };
}

test("parseYandexApiResponse unwraps the result envelope", () => {
  const parsed = parseYandexApiResponse<{ readonly track: string }>(
    createResponse({
      invocationInfo: {
        hostname: "music-backend",
      },
      result: {
        track: "Song",
      },
    }),
  );

  assert.deepEqual(parsed, {
    track: "Song",
  });
});

test("parseYandexApiResponse maps 400 responses into BadRequestError", () => {
  assert.throws(
    () =>
      parseYandexApiResponse(
        createResponse(
          {
            error: {
              message: "Missing id parameter",
            },
          },
          400,
        ),
      ),
    (error: unknown) => {
      assert.ok(error instanceof BadRequestError);
      assert.equal(error.message, "Missing id parameter");
      return true;
    },
  );
});

test("parseYandexApiResponse maps authorization failures from the API envelope", () => {
  assert.throws(
    () =>
      parseYandexApiResponse(
        createResponse({
          error: {
            name: "unauthorized",
            message: "Token expired",
          },
        }),
      ),
    (error: unknown) => {
      assert.ok(error instanceof UnauthorizedError);
      assert.equal(error.message, "Token expired");
      return true;
    },
  );
});

test("parseYandexApiResponse maps 404 responses into NotFoundError", () => {
  assert.throws(
    () => parseYandexApiResponse(createResponse("Resource missing", 404)),
    (error: unknown) => {
      assert.ok(error instanceof NotFoundError);
      return true;
    },
  );
});

test("parseYandexApiResponse falls back to UnknownApiError for unmapped API failures", () => {
  assert.throws(
    () =>
      parseYandexApiResponse(
        createResponse({
          error: "upstream-overload",
          message: "Backend is overloaded",
        }),
      ),
    (error: unknown) => {
      assert.ok(error instanceof UnknownApiError);
      assert.equal(error.message, "Backend is overloaded");
      return true;
    },
  );
});
