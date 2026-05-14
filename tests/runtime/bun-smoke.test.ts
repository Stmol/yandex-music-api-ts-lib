import {
  PlaylistDiffBuilder,
  Status,
  YandexMusicClient,
  type HttpRequest,
  type HttpResponse,
  type HttpTransport,
} from "../../src/index.ts";
import { TrackShort } from "../../src/models/index.ts";

type TestRunner = (name: string, fn: () => Promise<void> | void) => void;

const runtime = globalThis as typeof globalThis & {
  Bun?: unknown;
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
            display_name: "Bun Listener",
            uid: 202,
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

if (runtime.Bun !== undefined) {
  // @ts-expect-error Bun provides this runtime-only test module.
  const { test } = await import("bun:test") as { test: TestRunner };

  test("Bun can import the package entrypoints and use a custom transport", async () => {
    const transport = new SmokeTransport();
    const client = new YandexMusicClient({ transport });

    const status = await client.account.status({ language: "en" });
    const diff = new PlaylistDiffBuilder().delete(0, 1);
    const track = TrackShort.fromJSON({
      id: "track-1",
      title: "Runtime Smoke",
    });

    assertEqual(status instanceof Status, true, "status model type");
    assertEqual(status.account?.displayName, "Bun Listener", "account display name");
    assertEqual(status.hasActiveSubscription, true, "subscription flag");
    assertEqual(track.title, "Runtime Smoke", "models subpath import");
    assertEqual(diff.toJSON(), "[{\"from\":0,\"op\":\"delete\",\"to\":1}]", "playlist diff builder export");
    assertEqual(transport.requests.length, 1, "request count");
    assertEqual(transport.requests[0]?.path, "/users/account/status", "request path");
    assertEqual(transport.requests[0]?.query?.lang, "en", "request language");
  });
}
