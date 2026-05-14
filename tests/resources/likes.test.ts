import assert from "node:assert/strict";
import test from "node:test";

import { BadRequestError } from "../../src/core/errors.ts";
import type { JsonValue } from "../../src/core/json.ts";
import type { HttpRequest, HttpResponse, HttpTransport } from "../../src/http/types.ts";
import { LikesResource } from "../../src/resources/likes.ts";

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

function okResponse(result: JsonValue = "ok"): HttpResponse {
  return {
    body: {
      result,
    },
    headers: {},
    status: 200,
    statusText: "OK",
    url: "https://api.music.yandex.net/users/501/likes/tracks/add-multiple",
  };
}

function formEntries(body: BodyInit | null | undefined): Record<string, string> {
  assert.ok(body instanceof URLSearchParams);

  return Object.fromEntries(body.entries());
}

test("likes resource posts add/remove track likes and accepts revision objects", async () => {
  const addTransport = new MockTransport(okResponse({ revision: 10 }));
  const addResource = new LikesResource(addTransport);

  const added = await addResource.addTracks(["11:22", 33], { userId: 501 });

  assert.equal(added, true);
  assert.equal(addTransport.capturedRequest?.method, "POST");
  assert.equal(addTransport.capturedRequest?.path, "/users/501/likes/tracks/add-multiple");
  assert.deepEqual(formEntries(addTransport.capturedRequest?.body), {
    "track-ids": "11:22,33",
  });

  const removeTransport = new MockTransport(okResponse({ revision: 11 }));
  const removeResource = new LikesResource(removeTransport);

  const removed = await removeResource.removeTracks([11], { userId: 501 });

  assert.equal(removed, true);
  assert.equal(removeTransport.capturedRequest?.path, "/users/501/likes/tracks/remove");
  assert.deepEqual(formEntries(removeTransport.capturedRequest?.body), {
    "track-ids": "11",
  });
});

test("likes resource accepts single ids as well as id arrays", async () => {
  const transport = new MockTransport(okResponse());
  const resource = new LikesResource(transport);

  const result = await resource.addAlbums(1, { userId: 501 });

  assert.equal(result, true);
  assert.equal(transport.capturedRequest?.path, "/users/501/likes/albums/add-multiple");
  assert.deepEqual(formEntries(transport.capturedRequest?.body), {
    "album-ids": "1",
  });
});

test("likes resource posts album, artist, and playlist like mutations", async () => {
  const cases = [
    {
      bodyKey: "album-ids",
      call: async (resource: LikesResource) => resource.addAlbums([1, 2], { userId: 501 }),
      path: "/users/501/likes/albums/add-multiple",
      value: "1,2",
    },
    {
      bodyKey: "album-ids",
      call: async (resource: LikesResource) => resource.removeAlbums([1], { userId: 501 }),
      path: "/users/501/likes/albums/remove",
      value: "1",
    },
    {
      bodyKey: "artist-ids",
      call: async (resource: LikesResource) => resource.addArtists([7], { userId: 501 }),
      path: "/users/501/likes/artists/add-multiple",
      value: "7",
    },
    {
      bodyKey: "artist-ids",
      call: async (resource: LikesResource) => resource.removeArtists([7], { userId: 501 }),
      path: "/users/501/likes/artists/remove",
      value: "7",
    },
    {
      bodyKey: "playlist-ids",
      call: async (resource: LikesResource) => resource.addPlaylists(["501:100"], { userId: 501 }),
      path: "/users/501/likes/playlists/add-multiple",
      value: "501:100",
    },
    {
      bodyKey: "playlist-ids",
      call: async (resource: LikesResource) => resource.removePlaylists(["501:100"], { userId: 501 }),
      path: "/users/501/likes/playlists/remove",
      value: "501:100",
    },
  ] as const;

  for (const entry of cases) {
    const transport = new MockTransport(okResponse());
    const resource = new LikesResource(transport);

    const result = await entry.call(resource);

    assert.equal(result, true);
    assert.equal(transport.capturedRequest?.method, "POST");
    assert.equal(transport.capturedRequest?.path, entry.path);
    assert.deepEqual(formEntries(transport.capturedRequest?.body), {
      [entry.bodyKey]: entry.value,
    });
  }
});

test("likes resource posts track and artist dislike mutations", async () => {
  const cases = [
    {
      bodyKey: "track-ids",
      call: async (resource: LikesResource) => resource.addTrackDislikes([11], { userId: 501 }),
      path: "/users/501/dislikes/tracks/add-multiple",
      response: { revision: 12 },
      value: "11",
    },
    {
      bodyKey: "track-ids",
      call: async (resource: LikesResource) => resource.removeTrackDislikes([11], { userId: 501 }),
      path: "/users/501/dislikes/tracks/remove",
      response: { revision: 13 },
      value: "11",
    },
    {
      bodyKey: "artist-ids",
      call: async (resource: LikesResource) => resource.addArtistDislikes([7], { userId: 501 }),
      path: "/users/501/dislikes/artists/add-multiple",
      response: "ok",
      value: "7",
    },
    {
      bodyKey: "artist-ids",
      call: async (resource: LikesResource) => resource.removeArtistDislikes([7], { userId: 501 }),
      path: "/users/501/dislikes/artists/remove",
      response: "ok",
      value: "7",
    },
  ] as const;

  for (const entry of cases) {
    const transport = new MockTransport(okResponse(entry.response));
    const resource = new LikesResource(transport);

    const result = await entry.call(resource);

    assert.equal(result, true);
    assert.equal(transport.capturedRequest?.path, entry.path);
    assert.deepEqual(formEntries(transport.capturedRequest?.body), {
      [entry.bodyKey]: entry.value,
    });
  }
});

test("likes resource encodes user ids in mutation paths", async () => {
  const transport = new MockTransport(okResponse());
  const resource = new LikesResource(transport);

  await resource.addAlbums([1], { userId: "owner/name" });

  assert.equal(transport.capturedRequest?.path, "/users/owner%2Fname/likes/albums/add-multiple");
});

test("likes resource returns false for malformed success bodies", async () => {
  const transport = new MockTransport(okResponse({}));
  const resource = new LikesResource(transport);

  const result = await resource.addAlbums([1], { userId: 501 });

  assert.equal(result, false);
});

test("likes resource propagates API errors", async () => {
  const transport = new MockTransport({
    body: {
      error: {
        name: "bad-request",
        message: "Invalid ids",
      },
    },
    headers: {},
    status: 400,
    statusText: "Bad Request",
    url: "https://api.music.yandex.net/users/501/likes/albums/add-multiple",
  });
  const resource = new LikesResource(transport);

  await assert.rejects(
    async () => resource.addAlbums([1], { userId: 501 }),
    BadRequestError,
  );
});
