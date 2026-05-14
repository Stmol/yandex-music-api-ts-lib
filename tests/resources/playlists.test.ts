import assert from "node:assert/strict";
import test from "node:test";

import type { HttpRequest, HttpResponse, HttpTransport } from "../../src/http/types.ts";
import { GeneratedPlaylist } from "../../src/models/feed/GeneratedPlaylist.ts";
import { Playlist } from "../../src/models/playlist/Playlist.ts";
import { PlaylistRecommendations } from "../../src/models/playlist/PlaylistRecommendations.ts";
import { PlaylistSimilarEntities } from "../../src/models/playlist/PlaylistSimilarEntities.ts";
import { PlaylistsList } from "../../src/models/playlist/PlaylistsList.ts";
import { PlaylistTrailer } from "../../src/models/playlist/PlaylistTrailer.ts";
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

function okPlaylistArrayResponse(): HttpResponse {
  return {
    body: {
      result: [
        {
          kind: 100,
          owner: {
            uid: 501,
          },
          title: "Morning",
        },
      ],
    },
    headers: {},
    status: 200,
    statusText: "OK",
    url: "https://api.music.yandex.net/users/501/playlists",
  };
}

function formEntries(body: BodyInit | null | undefined): Record<string, string> {
  assert.ok(body instanceof URLSearchParams);

  return Object.fromEntries(body.entries());
}

function formEntriesAll(body: BodyInit | null | undefined): Record<string, string[]> {
  assert.ok(body instanceof URLSearchParams);

  const entries: Record<string, string[]> = {};
  for (const key of body.keys()) {
    entries[key] = body.getAll(key);
  }

  return entries;
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

test("playlists.byKinds posts repeated kind form fields", async () => {
  const transport = new MockTransport(okPlaylistArrayResponse());
  const resource = new PlaylistsResource(transport);

  const playlists = await resource.byKinds("owner/name", [100, "kind:2"]);

  assert.equal(transport.capturedRequest?.method, "POST");
  assert.equal(transport.capturedRequest?.path, "/users/owner%2Fname/playlists");
  assert.deepEqual(formEntriesAll(transport.capturedRequest?.body), {
    kinds: ["100", "kind:2"],
  });
  assert.ok(playlists[0] instanceof Playlist);
  assert.equal(playlists[0]?.title, "Morning");
});

test("playlists.recommendations parses recommended tracks", async () => {
  const transport = new MockTransport({
    body: {
      result: {
        batch_id: "batch-1",
        tracks: [
          {
            id: 11,
            title: "Recommended",
          },
        ],
      },
    },
    headers: {},
    status: 200,
    statusText: "OK",
    url: "https://api.music.yandex.net/users/501/playlists/100/recommendations",
  });
  const resource = new PlaylistsResource(transport);

  const recommendations = await resource.recommendations(501, "kind:1");

  assert.equal(
    transport.capturedRequest?.path,
    "/users/501/playlists/kind%3A1/recommendations",
  );
  assert.ok(recommendations instanceof PlaylistRecommendations);
  assert.equal(recommendations.batchId, "batch-1");
  assert.equal(recommendations.tracks?.[0]?.title, "Recommended");
});

test("playlists.collectiveJoin posts uid and token query params and parses ok", async () => {
  const transport = new MockTransport({
    body: {
      result: "ok",
    },
    headers: {},
    status: 200,
    statusText: "OK",
    url: "https://api.music.yandex.net/playlists/collective/join",
  });
  const resource = new PlaylistsResource(transport);

  const joined = await resource.collectiveJoin("owner/name", "token:1");

  assert.equal(joined, true);
  assert.equal(transport.capturedRequest?.method, "POST");
  assert.equal(transport.capturedRequest?.path, "/playlists/collective/join");
  assert.deepEqual(transport.capturedRequest?.query, {
    token: "token:1",
    uid: "owner/name",
  });
});

test("playlists.byUuid and similarEntities use public uuid endpoints", async () => {
  const playlistTransport = new MockTransport(okPlaylistResponse("By UUID"));
  const playlistResource = new PlaylistsResource(playlistTransport);

  const playlist = await playlistResource.byUuid("uuid/value");

  assert.equal(playlistTransport.capturedRequest?.path, "/playlist/uuid%2Fvalue");
  assert.ok(playlist instanceof Playlist);
  assert.equal(playlist.title, "By UUID");

  const similarTransport = new MockTransport({
    body: {
      result: {
        playlists: [
          {
            kind: 300,
            owner: {
              uid: 501,
            },
            title: "Similar",
          },
        ],
      },
    },
    headers: {},
    status: 200,
    statusText: "OK",
    url: "https://api.music.yandex.net/playlist/uuid/similar-entities",
  });
  const similarResource = new PlaylistsResource(similarTransport);

  const similar = await similarResource.similarEntities("uuid/value");

  assert.equal(similarTransport.capturedRequest?.path, "/playlist/uuid%2Fvalue/similar-entities");
  assert.ok(similar instanceof PlaylistSimilarEntities);
  assert.ok(similar.playlists?.[0] instanceof Playlist);
  assert.equal(similar.playlists?.[0]?.title, "Similar");
});

test("playlists.byIds and listShort serialize playlist ids", async () => {
  const listTransport = new MockTransport({
    body: {
      result: {
        pager: {
          page: 0,
          per_page: 10,
          total: 1,
        },
        playlists: [
          {
            kind: 100,
            owner: {
              uid: 501,
            },
            title: "Listed",
          },
        ],
      },
    },
    headers: {},
    status: 200,
    statusText: "OK",
    url: "https://api.music.yandex.net/playlists",
  });
  const listResource = new PlaylistsResource(listTransport);

  const list = await listResource.byIds(["501:100", "502:200"]);

  assert.equal(listTransport.capturedRequest?.method, "GET");
  assert.equal(listTransport.capturedRequest?.path, "/playlists");
  assert.deepEqual(listTransport.capturedRequest?.query, {
    playlistIds: "501:100,502:200",
  });
  assert.ok(list instanceof PlaylistsList);
  assert.ok(list.playlists?.[0] instanceof Playlist);

  const shortTransport = new MockTransport(okPlaylistArrayResponse());
  const shortResource = new PlaylistsResource(shortTransport);

  const shortList = await shortResource.listShort(["501:100", "502:200"]);

  assert.equal(shortTransport.capturedRequest?.method, "POST");
  assert.equal(shortTransport.capturedRequest?.path, "/playlists/list");
  assert.deepEqual(shortTransport.capturedRequest?.query, {
    "playlist-ids": ["501:100", "502:200"],
  });
  assert.ok(shortList[0] instanceof Playlist);
});

test("playlists.personal and trailer parse generated playlist models", async () => {
  const personalTransport = new MockTransport({
    body: {
      result: {
        playlist: {
          kind: 100,
          owner: {
            uid: 501,
          },
          title: "Personal",
        },
      },
    },
    headers: {},
    status: 200,
    statusText: "OK",
    url: "https://api.music.yandex.net/playlists/personal/morning",
  });
  const personalResource = new PlaylistsResource(personalTransport);

  const generated = await personalResource.personal("morning:1");

  assert.equal(personalTransport.capturedRequest?.path, "/playlists/personal/morning%3A1");
  assert.ok(generated instanceof GeneratedPlaylist);
  assert.ok(generated.playlist instanceof Playlist);

  const trailerTransport = new MockTransport({
    body: {
      result: {
        trailer_info: {
          available: true,
          duration_ms: 30000,
        },
      },
    },
    headers: {},
    status: 200,
    statusText: "OK",
    url: "https://api.music.yandex.net/users/501/playlists/100/trailer",
  });
  const trailerResource = new PlaylistsResource(trailerTransport);

  const trailer = await trailerResource.trailer("owner/name", "kind:1");

  assert.equal(
    trailerTransport.capturedRequest?.path,
    "/users/owner%2Fname/playlists/kind%3A1/trailer",
  );
  assert.ok(trailer instanceof PlaylistTrailer);
  assert.equal(trailer.trailerInfo?.available, true);
});

test("playlists.kinds parses number arrays and returns empty array for non-arrays", async () => {
  const transport = new MockTransport({
    body: {
      result: [100, "skip", 200],
    },
    headers: {},
    status: 200,
    statusText: "OK",
    url: "https://api.music.yandex.net/users/501/playlists/list/kinds",
  });
  const resource = new PlaylistsResource(transport);

  const kinds = await resource.kinds("owner/name");

  assert.equal(transport.capturedRequest?.path, "/users/owner%2Fname/playlists/list/kinds");
  assert.deepEqual(kinds, [100, 200]);

  const nonArrayTransport = new MockTransport({
    body: {
      result: {
        kinds: [100],
      },
    },
    headers: {},
    status: 200,
    statusText: "OK",
    url: "https://api.music.yandex.net/users/501/playlists/list/kinds",
  });
  const nonArrayResource = new PlaylistsResource(nonArrayTransport);

  assert.deepEqual(await nonArrayResource.kinds(501), []);
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

test("playlists.moveTrack and moveTracks build delete plus insert diffs", async () => {
  const singleTransport = new MockTransport(okPlaylistResponse());
  const singleResource = new PlaylistsResource(singleTransport);

  await singleResource.moveTrack(501, 100, {
    albumId: 22,
    at: 7,
    from: 2,
    revision: 10,
    trackId: 11,
  });

  const singleBody = formEntries(singleTransport.capturedRequest?.body);

  assert.equal(singleTransport.capturedRequest?.path, "/users/501/playlists/100/change");
  assert.equal(singleBody.revision, "10");
  assert.deepEqual(JSON.parse(singleBody.diff ?? ""), [
    {
      from: 2,
      op: "delete",
      to: 2,
    },
    {
      at: 7,
      op: "insert",
      tracks: [
        {
          albumId: "22",
          id: "11",
        },
      ],
    },
  ]);

  const manyTransport = new MockTransport(okPlaylistResponse());
  const manyResource = new PlaylistsResource(manyTransport);

  await manyResource.moveTracks(501, 100, {
    at: 1,
    from: 3,
    revision: 11,
    to: 4,
    tracks: [
      {
        albumId: "44",
        id: "33",
      },
      {
        albumId: 66,
        id: 55,
      },
    ],
  });

  const manyBody = formEntries(manyTransport.capturedRequest?.body);

  assert.equal(manyBody.revision, "11");
  assert.deepEqual(JSON.parse(manyBody.diff ?? ""), [
    {
      from: 3,
      op: "delete",
      to: 4,
    },
    {
      at: 1,
      op: "insert",
      tracks: [
        {
          albumId: "44",
          id: "33",
        },
        {
          albumId: "66",
          id: "55",
        },
      ],
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
