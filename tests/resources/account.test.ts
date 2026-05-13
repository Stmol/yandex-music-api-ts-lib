import assert from "node:assert/strict";
import test from "node:test";

import type { HttpRequest, HttpResponse, HttpTransport } from "../../src/http/types.ts";
import { AccountResource } from "../../src/resources/account.ts";

class MockTransport implements HttpTransport {
  capturedRequest: HttpRequest | undefined;
  private readonly response: HttpResponse;

  constructor(response: HttpResponse) {
    this.response = response;
  }

  async request(request: HttpRequest): Promise<HttpResponse> {
    this.capturedRequest = request;

    return this.response;
  }
}

test("account.status builds the expected request and parses Status", async () => {
  const transport = new MockTransport({
    body: {
      result: {
        account: {
          uid: 501,
          display_name: "Listener",
        },
        plus: {
          has_plus: true,
        },
      },
    },
    headers: {},
    status: 200,
    statusText: "OK",
    url: "https://api.music.yandex.net/users/account/status",
  });

  const resource = new AccountResource(transport);
  const status = await resource.status({ language: "en" });

  assert.equal(transport.capturedRequest?.method, "GET");
  assert.equal(transport.capturedRequest?.path, "/users/account/status");
  assert.deepEqual(transport.capturedRequest?.query, {
    lang: "en",
  });
  assert.equal(status.account?.displayName, "Listener");
  assert.equal(status.hasActiveSubscription, true);
});
