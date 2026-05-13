import { Status, YandexMusicClient, type HttpRequest, type HttpResponse, type HttpTransport } from "../../src/index.ts";
import { TrackShort } from "../../src/models/index.ts";

type TestRunner = (name: string, fn: () => Promise<void> | void) => void;

const runtime = globalThis as typeof globalThis & {
  Deno?: {
    test: TestRunner;
  };
};

function assertEqual<T>(actual: T, expected: T, message: string): void {
  if (!Object.is(actual, expected)) {
    throw new Error(`${message}: expected ${String(expected)}, received ${String(actual)}`);
  }
}

class SmokeTransport implements HttpTransport {
  readonly requests: HttpRequest[] = [];

  async request(request: HttpRequest): Promise<HttpResponse> {
    this.requests.push(request);

    return {
      body: {
        result: {
          account: {
            display_name: "Deno Listener",
            uid: 303,
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
    };
  }
}

runtime.Deno?.test("Deno can import the package entrypoints and use a custom transport", async () => {
  const transport = new SmokeTransport();
  const client = new YandexMusicClient({ transport });

  const status = await client.account.status({ language: "en" });
  const track = TrackShort.fromJSON({
    id: "track-1",
    title: "Runtime Smoke",
  });

  assertEqual(status instanceof Status, true, "status model type");
  assertEqual(status.account?.displayName, "Deno Listener", "account display name");
  assertEqual(status.hasActiveSubscription, true, "subscription flag");
  assertEqual(track.title, "Runtime Smoke", "models subpath import");
  assertEqual(transport.requests.length, 1, "request count");
  assertEqual(transport.requests[0]?.path, "/users/account/status", "request path");
  assertEqual(transport.requests[0]?.query?.lang, "en", "request language");
});
