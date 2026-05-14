import assert from "node:assert/strict";
import test from "node:test";

import type { HttpRequest, HttpResponse, HttpTransport } from "../../src/http/types.ts";
import { Playlist } from "../../src/models/playlist/Playlist.ts";
import {
  PlaylistDiffBuilder,
  PlaylistsResource,
  serializePlaylistDiff,
} from "../../src/resources/playlists.ts";

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

function okPlaylistResponse(title = "Updated"): HttpResponse {
  return {
    body: {
      result: {
        kind: 100,
        owner: {
          uid: 501,
        },
        title,
      },
    },
    headers: {},
    status: 200,
    statusText: "OK",
    url: "https://api.music.yandex.net/users/501/playlists/100",
  };
}

function formEntries(body: BodyInit | null | undefined): Record<string, string> {
  assert.ok(body instanceof URLSearchParams);

  return Object.fromEntries(body.entries());
}

test("playlists.list uses the user playlist list endpoint and parses Playlist models", async () => {
  const transport = new MockTransport({
    body: {
      result: [
        {
          kind: 100,
          title: "Morning",
          owner: {
            uid: 501,
          },
        },
      ],
    },
    headers: {},
    status: 200,
    statusText: "OK",
    url: "https://api.music.yandex.net/users/501/playlists/list",
  });

  const resource = new PlaylistsResource(transport);
  const playlists = await resource.list(501, { language: "en" });

  assert.equal(transport.capturedRequest?.path, "/users/501/playlists/list");
  assert.deepEqual(transport.capturedRequest?.query, {
    lang: "en",
  });
  assert.ok(playlists[0] instanceof Playlist);
  assert.equal(playlists[0]?.title, "Morning");
});

test("playlists.get builds the single playlist path and keeps nested handwritten parsing", async () => {
  const transport = new MockTransport({
    body: {
      result: {
        kind: 100,
        title: "Morning",
        owner: {
          uid: 700,
        },
        tracks: [
          {
            id: 1,
            title: "Wake Up",
          },
        ],
      },
    },
    headers: {},
    status: 200,
    statusText: "OK",
    url: "https://api.music.yandex.net/users/501/playlists/100",
  });

  const resource = new PlaylistsResource(transport);
  const playlist = await resource.get(501, 100, { richTracks: true });

  assert.equal(transport.capturedRequest?.path, "/users/501/playlists/100");
  assert.deepEqual(transport.capturedRequest?.query, {
    lang: undefined,
    "rich-tracks": true,
  });
  assert.ok(playlist instanceof Playlist);
  assert.equal(playlist.ownerUid, 700);
  assert.equal(playlist.tracks?.[0]?.title, "Wake Up");
});

test("playlists.create posts form fields and parses the created playlist", async () => {
  const transport = new MockTransport(okPlaylistResponse("Created"));
  const resource = new PlaylistsResource(transport);

  const playlist = await resource.create(501, {
    title: "Created",
    visibility: "private",
  });

  assert.equal(transport.capturedRequest?.method, "POST");
  assert.equal(transport.capturedRequest?.path, "/users/501/playlists/create");
  assert.equal(
    transport.capturedRequest?.headers?.["Content-Type"],
    "application/x-www-form-urlencoded;charset=UTF-8",
  );
  assert.deepEqual(formEntries(transport.capturedRequest?.body), {
    title: "Created",
    visibility: "private",
  });
  assert.ok(playlist instanceof Playlist);
  assert.equal(playlist.title, "Created");
});

test("playlists.delete posts to the delete endpoint and parses ok result", async () => {
  const transport = new MockTransport({
    body: {
      result: "ok",
    },
    headers: {},
    status: 200,
    statusText: "OK",
    url: "https://api.music.yandex.net/users/501/playlists/100/delete",
  });
  const resource = new PlaylistsResource(transport);

  const deleted = await resource.delete(501, 100);

  assert.equal(deleted, true);
  assert.equal(transport.capturedRequest?.method, "POST");
  assert.equal(transport.capturedRequest?.path, "/users/501/playlists/100/delete");
});

test("playlists.rename, visibility, and description post value form fields", async () => {
  const methods = [
    {
      call: async (resource: PlaylistsResource) => resource.rename(501, 100, "Renamed"),
      path: "/users/501/playlists/100/name",
      value: "Renamed",
    },
    {
      call: async (resource: PlaylistsResource) => resource.setVisibility(501, 100, "public"),
      path: "/users/501/playlists/100/visibility",
      value: "public",
    },
    {
      call: async (resource: PlaylistsResource) => resource.setDescription(501, 100, "About"),
      path: "/users/501/playlists/100/description",
      value: "About",
    },
  ] as const;

  for (const entry of methods) {
    const transport = new MockTransport(okPlaylistResponse(entry.value));
    const resource = new PlaylistsResource(transport);
    const playlist = await entry.call(resource);

    assert.equal(transport.capturedRequest?.method, "POST");
    assert.equal(transport.capturedRequest?.path, entry.path);
    assert.deepEqual(formEntries(transport.capturedRequest?.body), {
      value: entry.value,
    });
    assert.ok(playlist instanceof Playlist);
  }
});

test("playlist diff builder serializes insert and delete operations in API shape", () => {
  const diff = new PlaylistDiffBuilder()
    .insert(0, {
      albumId: 22,
      id: 11,
    })
    .delete(3, 4);

  assert.deepEqual(JSON.parse(diff.toJSON()), [
    {
      at: 0,
      op: "insert",
      tracks: [
        {
          albumId: "22",
          id: "11",
        },
      ],
    },
    {
      from: 3,
      op: "delete",
      to: 4,
    },
  ]);
});

test("playlists.change posts revision and serialized diff", async () => {
  const transport = new MockTransport(okPlaylistResponse());
  const resource = new PlaylistsResource(transport);
  const diff = serializePlaylistDiff([
    {
      at: 2,
      op: "insert",
      tracks: [
        {
          albumId: "44",
          id: "33",
        },
      ],
    },
  ]);

  const playlist = await resource.change(501, 100, {
    diff,
    revision: 7,
  });

  assert.equal(transport.capturedRequest?.method, "POST");
  assert.equal(transport.capturedRequest?.path, "/users/501/playlists/100/change");
  assert.deepEqual(formEntries(transport.capturedRequest?.body), {
    diff,
    kind: "100",
    revision: "7",
  });
  assert.ok(playlist instanceof Playlist);
});

test("playlists.insertTrack and deleteTracks build change diffs", async () => {
  const insertTransport = new MockTransport(okPlaylistResponse());
  const insertResource = new PlaylistsResource(insertTransport);

  await insertResource.insertTrack(501, 100, {
    albumId: 22,
    at: 5,
    revision: 8,
    trackId: 11,
  });

  const insertBody = formEntries(insertTransport.capturedRequest?.body);

  assert.equal(insertTransport.capturedRequest?.path, "/users/501/playlists/100/change");
  assert.equal(insertBody.kind, "100");
  assert.equal(insertBody.revision, "8");
  assert.deepEqual(JSON.parse(insertBody.diff ?? ""), [
    {
      at: 5,
      op: "insert",
      tracks: [
        {
          albumId: "22",
          id: "11",
        },
      ],
    },
  ]);

  const deleteTransport = new MockTransport(okPlaylistResponse());
  const deleteResource = new PlaylistsResource(deleteTransport);

  await deleteResource.deleteTracks(501, 100, {
    from: 2,
    revision: 9,
    to: 3,
  });

  const deleteBody = formEntries(deleteTransport.capturedRequest?.body);

  assert.equal(deleteTransport.capturedRequest?.path, "/users/501/playlists/100/change");
  assert.equal(deleteBody.revision, "9");
  assert.deepEqual(JSON.parse(deleteBody.diff ?? ""), [
    {
      from: 2,
      op: "delete",
      to: 3,
    },
  ]);
});

test("playlist mutation paths encode user id and kind segments", async () => {
  const transport = new MockTransport(okPlaylistResponse());
  const resource = new PlaylistsResource(transport);

  await resource.rename("owner/name", "kind:1", "Encoded");

  assert.equal(transport.capturedRequest?.path, "/users/owner%2Fname/playlists/kind%3A1/name");
});
