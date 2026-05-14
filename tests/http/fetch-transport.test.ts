import assert from "node:assert/strict";
import test from "node:test";

import { AbortError, NetworkError, TimeoutError, UnknownApiError } from "../../src/core/errors.ts";
import { FetchTransport } from "../../src/http/fetch-transport.ts";
import type {
  HttpErrorLogEvent,
  HttpLogger,
  HttpRequestLogEvent,
  HttpResponseLogEvent,
} from "../../src/http/logger.ts";

class RecordingHttpLogger implements HttpLogger {
  readonly errors: HttpErrorLogEvent[] = [];
  readonly requests: HttpRequestLogEvent[] = [];
  readonly responses: HttpResponseLogEvent[] = [];

  onError(event: HttpErrorLogEvent): void {
    this.errors.push(event);
  }

  onRequest(event: HttpRequestLogEvent): void {
    this.requests.push(event);
  }

  onResponse(event: HttpResponseLogEvent): void {
    this.responses.push(event);
  }
}

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
    path: "/account/status",
    query: {
      lang: "en",
    },
  });

  assert.equal(capturedUrl, "https://api.music.yandex.net/account/status?lang=en");
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

test("FetchTransport closes a retriable response body before retrying", async () => {
  let attempts = 0;
  let cancelledBodies = 0;

  const transport = new FetchTransport({
    defaultRetry: {
      baseDelayMs: 0,
      maxDelayMs: 0,
      maxRetries: 1,
    },
    fetch: async () => {
      attempts += 1;

      if (attempts === 1) {
        const body = new ReadableStream({
          cancel() {
            cancelledBodies += 1;
          },
          start(controller) {
            controller.enqueue(new TextEncoder().encode(JSON.stringify({ error: "temporary-overload" })));
          },
        });

        return new Response(body, {
          headers: {
            "content-type": "application/json",
          },
          status: 503,
          statusText: "Service Unavailable",
        });
      }

      assert.equal(cancelledBodies, 1);

      return new Response(JSON.stringify({ result: { ok: true } }), {
        headers: {
          "content-type": "application/json",
        },
        status: 200,
      });
    },
  });

  const response = await transport.request({
    path: "/retry-status-close-body",
  });

  assert.equal(attempts, 2);
  assert.equal(cancelledBodies, 1);
  assert.deepEqual(response.body, {
    result: {
      ok: true,
    },
  });
});

test("FetchTransport does not retry or wrap malformed JSON responses", async () => {
  let attempts = 0;

  const transport = new FetchTransport({
    defaultRetry: {
      baseDelayMs: 0,
      maxDelayMs: 0,
      maxRetries: 2,
    },
    fetch: async () => {
      attempts += 1;

      return new Response("{malformed-json", {
        headers: {
          "content-type": "application/json",
        },
        status: 200,
      });
    },
  });

  await assert.rejects(
    () =>
      transport.request({
        path: "/malformed-json",
      }),
    (error: unknown) => {
      assert.ok(error instanceof UnknownApiError);
      assert.ok(!(error instanceof NetworkError));
      assert.equal(error.url, "");
      return true;
    },
  );

  assert.equal(attempts, 1);
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

test("FetchTransport maps already-aborted signals with custom reasons to AbortError without retrying", async () => {
  let attempts = 0;
  const controller = new AbortController();
  const abortReason = new Error("cancelled before dispatch");

  controller.abort(abortReason);

  const transport = new FetchTransport({
    defaultRetry: {
      baseDelayMs: 0,
      maxDelayMs: 0,
      maxRetries: 2,
    },
    fetch: async (_input, init) => {
      attempts += 1;

      if (init?.signal?.aborted) {
        throw init.signal.reason;
      }

      throw new TypeError("fetch should receive an already-aborted signal");
    },
  });

  await assert.rejects(
    () =>
      transport.request({
        path: "/already-aborted",
        signal: controller.signal,
      }),
    (error: unknown) => {
      assert.ok(error instanceof AbortError);
      assert.equal(error.cause, abortReason);
      return true;
    },
  );

  assert.equal(attempts, 1);
});

test("FetchTransport requires exactly one of path or url at runtime", async () => {
  let attempts = 0;

  const transport = new FetchTransport({
    fetch: async () => {
      attempts += 1;
      return new Response(null, { status: 204 });
    },
  });

  await assert.rejects(
    () => transport.request({} as Parameters<typeof transport.request>[0]),
    {
      message: "HttpRequest must include exactly one of path or url.",
      name: "TypeError",
    },
  );

  await assert.rejects(
    () =>
      transport.request({
        path: "/account/status",
        url: "https://api.music.yandex.net/account/status",
      } as Parameters<typeof transport.request>[0]),
    {
      message: "HttpRequest must include exactly one of path or url.",
      name: "TypeError",
    },
  );

  assert.equal(attempts, 0);
});

test("FetchTransport keeps logging disabled by default", async () => {
  const originalInfo = console.info;
  const originalError = console.error;
  const infoCalls: unknown[][] = [];
  const errorCalls: unknown[][] = [];

  console.info = (...args: unknown[]) => {
    infoCalls.push(args);
  };
  console.error = (...args: unknown[]) => {
    errorCalls.push(args);
  };

  try {
    const transport = new FetchTransport({
      fetch: async () =>
        new Response(JSON.stringify({ result: { ok: true } }), {
          headers: {
            "content-type": "application/json",
          },
          status: 200,
          statusText: "OK",
        }),
    });

    const response = await transport.request({
      path: "/logging-disabled",
    });

    assert.equal(response.status, 200);
    assert.deepEqual(infoCalls, []);
    assert.deepEqual(errorCalls, []);
  } finally {
    console.info = originalInfo;
    console.error = originalError;
  }
});

test("FetchTransport uses the default console logger when logging is enabled", async () => {
  const originalInfo = console.info;
  const originalError = console.error;
  const infoCalls: unknown[][] = [];
  const errorCalls: unknown[][] = [];

  console.info = (...args: unknown[]) => {
    infoCalls.push(args);
  };
  console.error = (...args: unknown[]) => {
    errorCalls.push(args);
  };

  try {
    const transport = new FetchTransport({
      enableHttpLogging: true,
      fetch: async () =>
        new Response(JSON.stringify({ result: { ok: true } }), {
          headers: {
            "content-type": "application/json",
            "set-cookie": "session=secret",
          },
          status: 200,
          statusText: "OK",
        }),
      oauthToken: "token-123",
    });

    await transport.request({
      path: "/logging-console",
    });

    assert.equal(infoCalls.length, 2);
    assert.equal(errorCalls.length, 0);
    assert.equal(infoCalls[0]?.[0], "HTTP request");
    assert.equal(infoCalls[1]?.[0], "HTTP response");
    assert.equal((infoCalls[0]?.[1] as { headers?: Record<string, string> }).headers?.authorization, "[REDACTED]");
    assert.equal((infoCalls[1]?.[1] as { headers?: Record<string, string> }).headers?.["set-cookie"], "[REDACTED]");
  } finally {
    console.info = originalInfo;
    console.error = originalError;
  }
});

test("FetchTransport logs every retried status response through a custom logger", async () => {
  let attempts = 0;
  const logger = new RecordingHttpLogger();
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
        statusText: "OK",
      });
    },
    httpLogger: logger,
    oauthToken: "token-123",
  });

  const response = await transport.request({
    path: "/retry-logging-status",
  });

  assert.equal(response.status, 200);
  assert.equal(logger.requests.length, 2);
  assert.equal(logger.responses.length, 2);
  assert.equal(logger.errors.length, 0);
  assert.equal(logger.requests[0]?.attempt, 1);
  assert.equal(logger.requests[1]?.attempt, 2);
  assert.equal(logger.requests[0]?.headers.authorization, "[REDACTED]");
  assert.equal(logger.responses[0]?.status, 503);
  assert.equal(logger.responses[0]?.willRetry, true);
  assert.equal(logger.responses[1]?.status, 200);
  assert.equal(logger.responses[1]?.willRetry, false);
});

test("FetchTransport logs every retried network error through a custom logger", async () => {
  let attempts = 0;
  const logger = new RecordingHttpLogger();
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
    httpLogger: logger,
  });

  const response = await transport.request({
    path: "/retry-logging-network",
  });

  assert.equal(response.status, 200);
  assert.equal(logger.requests.length, 2);
  assert.equal(logger.responses.length, 1);
  assert.equal(logger.errors.length, 1);
  assert.equal(logger.errors[0]?.attempt, 1);
  assert.equal(logger.errors[0]?.willRetry, true);
  assert.equal(logger.responses[0]?.attempt, 2);
  assert.equal(logger.responses[0]?.willRetry, false);
});

test("FetchTransport logs final timeout errors through a custom logger", async () => {
  const logger = new RecordingHttpLogger();
  const transport = new FetchTransport({
    defaultRetry: {
      maxRetries: 0,
    },
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
    httpLogger: logger,
  });

  await assert.rejects(
    () => transport.request({ path: "/timeout-logging" }),
    (error: unknown) => {
      assert.ok(error instanceof TimeoutError);
      return true;
    },
  );

  assert.equal(logger.requests.length, 1);
  assert.equal(logger.responses.length, 0);
  assert.equal(logger.errors.length, 1);
  assert.equal(logger.errors[0]?.willRetry, false);
});

test("FetchTransport logs final abort errors through a custom logger", async () => {
  const logger = new RecordingHttpLogger();
  const controller = new AbortController();
  const transport = new FetchTransport({
    fetch: async (_input, init) =>
      new Promise<Response>((_resolve, reject) => {
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
    httpLogger: logger,
  });

  await assert.rejects(
    () =>
      transport.request({
        path: "/abort-logging",
        signal: controller.signal,
      }),
    (error: unknown) => {
      assert.ok(error instanceof AbortError);
      return true;
    },
  );

  assert.equal(logger.requests.length, 1);
  assert.equal(logger.responses.length, 0);
  assert.equal(logger.errors.length, 1);
  assert.equal(logger.errors[0]?.willRetry, false);
});
