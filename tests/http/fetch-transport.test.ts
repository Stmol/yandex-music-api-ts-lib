import assert from "node:assert/strict";
import test from "node:test";

import { AbortError, TimeoutError } from "../../src/core/errors.ts";
import { FetchTransport } from "../../src/http/fetch-transport.ts";

test("FetchTransport applies default headers and injects the OAuth token", async () => {
  let capturedUrl: string | undefined;
  let capturedHeaders: Headers | undefined;

  const transport = new FetchTransport({
    fetch: async (input, init) => {
      capturedUrl = input instanceof Request ? input.url : String(input);
      capturedHeaders = new Headers(init?.headers);

      return new Response(JSON.stringify({ result: { ok: true } }), {
        headers: {
          "content-type": "application/json",
        },
        status: 200,
      });
    },
    oauthToken: "token-123",
  });

  const response = await transport.request({
    headers: {
      "X-Test-Header": "yes",
    },
    path: "/users/account/status",
    query: {
      lang: "en",
    },
  });

  assert.equal(capturedUrl, "https://api.music.yandex.net/users/account/status?lang=en");
  assert.equal(capturedHeaders?.get("accept"), "application/json");
  assert.equal(capturedHeaders?.get("authorization"), "OAuth token-123");
  assert.equal(capturedHeaders?.get("x-test-header"), "yes");
  assert.deepEqual(response.body, {
    result: {
      ok: true,
    },
  });
});

test("FetchTransport throws TimeoutError when the request exceeds the timeout", async () => {
  const transport = new FetchTransport({
    defaultTimeoutMs: 5,
    fetch: async (_input, init) =>
      new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener(
          "abort",
          () => {
            reject(
              init?.signal?.reason instanceof Error
                ? init.signal.reason
                : new Error("aborted"),
            );
          },
          { once: true },
        );
      }),
  });

  await assert.rejects(
    () => transport.request({ path: "/timeout" }),
    (error: unknown) => {
      assert.ok(error instanceof TimeoutError);
      assert.equal(error.url, "https://api.music.yandex.net/timeout");
      return true;
    },
  );
});

test("FetchTransport retries a transient network failure for idempotent requests", async () => {
  let attempts = 0;

  const transport = new FetchTransport({
    defaultRetry: {
      baseDelayMs: 0,
      maxDelayMs: 0,
      maxRetries: 2,
    },
    fetch: async () => {
      attempts += 1;

      if (attempts === 1) {
        throw new TypeError("temporary network issue");
      }

      return new Response(JSON.stringify({ result: { ok: true } }), {
        headers: {
          "content-type": "application/json",
        },
        status: 200,
      });
    },
  });

  const response = await transport.request({
    path: "/retry-network",
  });

  assert.equal(attempts, 2);
  assert.deepEqual(response.body, {
    result: {
      ok: true,
    },
  });
});

test("FetchTransport retries retriable status codes for idempotent requests", async () => {
  let attempts = 0;

  const transport = new FetchTransport({
    defaultRetry: {
      baseDelayMs: 0,
      maxDelayMs: 0,
      maxRetries: 2,
    },
    fetch: async () => {
      attempts += 1;

      if (attempts === 1) {
        return new Response(JSON.stringify({ error: "temporary-overload" }), {
          headers: {
            "content-type": "application/json",
            "retry-after": "0",
          },
          status: 503,
          statusText: "Service Unavailable",
        });
      }

      return new Response(JSON.stringify({ result: { ok: true } }), {
        headers: {
          "content-type": "application/json",
        },
        status: 200,
      });
    },
  });

  const response = await transport.request({
    path: "/retry-status",
  });

  assert.equal(attempts, 2);
  assert.deepEqual(response.body, {
    result: {
      ok: true,
    },
  });
});

test("FetchTransport does not retry non-idempotent requests by default", async () => {
  let attempts = 0;

  const transport = new FetchTransport({
    defaultRetry: {
      baseDelayMs: 0,
      maxDelayMs: 0,
      maxRetries: 2,
    },
    fetch: async () => {
      attempts += 1;
      throw new TypeError("temporary network issue");
    },
  });

  await assert.rejects(
    () =>
      transport.request({
        method: "POST",
        path: "/no-retry-post",
      }),
  );

  assert.equal(attempts, 1);
});

test("FetchTransport maps external aborts to AbortError without retrying", async () => {
  let attempts = 0;
  const controller = new AbortController();

  const transport = new FetchTransport({
    defaultRetry: {
      baseDelayMs: 0,
      maxDelayMs: 0,
      maxRetries: 2,
    },
    fetch: async (_input, init) =>
      new Promise<Response>((_resolve, reject) => {
        attempts += 1;

        init?.signal?.addEventListener(
          "abort",
          () => {
            reject(
              init?.signal?.reason instanceof Error
                ? init.signal.reason
                : new DOMException("Aborted", "AbortError"),
            );
          },
          { once: true },
        );

        queueMicrotask(() => controller.abort(new Error("cancelled by caller")));
      }),
  });

  await assert.rejects(
    () =>
      transport.request({
        path: "/external-abort",
        signal: controller.signal,
      }),
    (error: unknown) => {
      assert.ok(error instanceof AbortError);
      assert.equal(attempts, 1);
      return true;
    },
  );
});
