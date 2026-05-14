import assert from "node:assert/strict";
import test from "node:test";

import { BadRequestError } from "../../src/core/errors.ts";
import type { JsonValue } from "../../src/core/json.ts";
import type { HttpRequest, HttpResponse, HttpTransport } from "../../src/http/types.ts";
import { Album } from "../../src/models/album/Album.ts";
import { Artist } from "../../src/models/artist/Artist.ts";
import { ClipsWillLike } from "../../src/models/clip/ClipsWillLike.ts";
import { Playlist } from "../../src/models/playlist/Playlist.ts";
import { Like } from "../../src/models/shared/Like.ts";
import { TracksList } from "../../src/models/shared/TracksList.ts";
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

test("likes resource reads liked tracks from result.library", async () => {
  const transport = new MockTransport({
    body: {
      result: {
        library: {
          uid: 501,
          revision: 12,
          items: [
            {
              id: "11:22",
              album_id: 22,
            },
          ],
          track_ids: ["11:22"],
        },
      },
    },
    headers: {},
    status: 200,
    statusText: "OK",
    url: "https://api.music.yandex.net/users/501/likes/tracks",
  });
  const resource = new LikesResource(transport);

  const tracks = await resource.likedTracks(501, { ifModifiedSinceRevision: 10 });

  assert.equal(transport.capturedRequest?.method, "GET");
  assert.equal(transport.capturedRequest?.path, "/users/501/likes/tracks");
  assert.deepEqual(transport.capturedRequest?.query, {
    "if-modified-since-revision": 10,
  });
  assert.ok(tracks instanceof TracksList);
  assert.equal(tracks.revision, 12);
  assert.deepEqual(tracks.trackIds, ["11:22"]);
});

test("likes resource reads liked albums, artists, and playlists as Like arrays", async () => {
  const cases = [
    {
      call: async (resource: LikesResource) => resource.likedAlbums("owner/name", { rich: false }),
      expectedQuery: { rich: false },
      path: "/users/owner%2Fname/likes/albums",
      result: [{
        album: {
          id: 31,
          title: "Album",
        },
        id: "album-like",
        timestamp: "2026-05-14T10:00:00Z",
      }],
    },
    {
      call: async (resource: LikesResource) => resource.likedArtists(501),
      expectedQuery: { "with-timestamps": true },
      path: "/users/501/likes/artists",
      result: [{ id: 7, name: "Artist", timestamp: "2026-05-14T10:00:00Z" }],
    },
    {
      call: async (resource: LikesResource) => resource.likedPlaylists(501),
      expectedQuery: undefined,
      path: "/users/501/likes/playlists",
      result: [{
        playlist: {
          kind: 100,
          owner: {
            uid: 501,
          },
          title: "Playlist",
        },
        timestamp: "2026-05-14T10:00:00Z",
      }],
    },
  ] as const;

  for (const entry of cases) {
    const transport = new MockTransport(okResponse(entry.result));
    const resource = new LikesResource(transport);

    const likes = await entry.call(resource);

    assert.equal(transport.capturedRequest?.method, "GET");
    assert.equal(transport.capturedRequest?.path, entry.path);
    assert.deepEqual(transport.capturedRequest?.query, entry.expectedQuery);
    assert.ok(likes[0] instanceof Like);
  }
});

test("likes resource parses rich liked entity payloads", async () => {
  const albumTransport = new MockTransport(okResponse([{ album: { id: 31, title: "Album" } }]));
  const albumLikes = await new LikesResource(albumTransport).likedAlbums(501);

  assert.equal(albumLikes[0]?.type, "album");
  assert.ok(albumLikes[0]?.album instanceof Album);
  assert.equal(albumLikes[0]?.album?.title, "Album");

  const artistTransport = new MockTransport(okResponse([{ id: 7, name: "Artist" }]));
  const artistLikes = await new LikesResource(artistTransport).likedArtists(501);

  assert.equal(artistLikes[0]?.type, "artist");
  assert.ok(artistLikes[0]?.artist instanceof Artist);
  assert.equal(artistLikes[0]?.artist?.displayName, "Artist");

  const playlistTransport = new MockTransport(okResponse([{
    playlist: {
      kind: 100,
      title: "Playlist",
    },
  }]));
  const playlistLikes = await new LikesResource(playlistTransport).likedPlaylists(501);

  assert.equal(playlistLikes[0]?.type, "playlist");
  assert.ok(playlistLikes[0]?.playlist instanceof Playlist);
  assert.equal(playlistLikes[0]?.playlist?.title, "Playlist");
});

test("likes resource applies default query params for liked album and artist reads", async () => {
  const albumsTransport = new MockTransport(okResponse([]));
  const albumsResource = new LikesResource(albumsTransport);

  await albumsResource.likedAlbums(501);

  assert.deepEqual(albumsTransport.capturedRequest?.query, {
    rich: true,
  });

  const artistsTransport = new MockTransport(okResponse([]));
  const artistsResource = new LikesResource(artistsTransport);

  await artistsResource.likedArtists(501, { withTimestamps: false });

  assert.deepEqual(artistsTransport.capturedRequest?.query, {
    "with-timestamps": false,
  });
});

test("likes resource reads disliked tracks with upstream if_modified_since_revision query", async () => {
  const transport = new MockTransport({
    body: {
      result: {
        library: {
          uid: 501,
          revision: 14,
          track_ids: [11],
        },
      },
    },
    headers: {},
    status: 200,
    statusText: "OK",
    url: "https://api.music.yandex.net/users/501/dislikes/tracks",
  });
  const resource = new LikesResource(transport);

  const tracks = await resource.dislikedTracks(501, { ifModifiedSinceRevision: 13 });

  assert.equal(transport.capturedRequest?.method, "GET");
  assert.equal(transport.capturedRequest?.path, "/users/501/dislikes/tracks");
  assert.deepEqual(transport.capturedRequest?.query, {
    if_modified_since_revision: 13,
  });
  assert.ok(tracks instanceof TracksList);
  assert.equal(tracks.revision, 14);
});

test("likes resource reads disliked artists as Artist arrays", async () => {
  const transport = new MockTransport(okResponse([
    {
      id: 7,
      name: "Artist",
    },
  ]));
  const resource = new LikesResource(transport);

  const artists = await resource.dislikedArtists(501);

  assert.equal(transport.capturedRequest?.method, "GET");
  assert.equal(transport.capturedRequest?.path, "/users/501/dislikes/artists");
  assert.ok(artists[0] instanceof Artist);
  assert.equal(artists[0]?.displayName, "Artist");
});

test("likes resource reads liked clips with default pagination", async () => {
  const transport = new MockTransport(okResponse({
    clips: [
      {
        id: "clip-1",
        title: "Clip",
      },
    ],
  }));
  const resource = new LikesResource(transport);

  const clips = await resource.likedClips(501);

  assert.equal(transport.capturedRequest?.method, "GET");
  assert.equal(transport.capturedRequest?.path, "/users/501/likes/clips");
  assert.deepEqual(transport.capturedRequest?.query, {
    page: 0,
    pageSize: 100,
  });
  assert.ok(clips instanceof ClipsWillLike);
  assert.equal(clips.clips?.[0]?.title, "Clip");
});

test("likes resource reads liked clips with custom pagination", async () => {
  const transport = new MockTransport(okResponse({ clips: [] }));
  const resource = new LikesResource(transport);

  await resource.likedClips(501, { page: 2, pageSize: 25 });

  assert.deepEqual(transport.capturedRequest?.query, {
    page: 2,
    pageSize: 25,
  });
});

test("likes resource posts clip like mutations", async () => {
  const addTransport = new MockTransport(okResponse({ revision: 15 }));
  const addResource = new LikesResource(addTransport);

  const added = await addResource.addClip("clip/1", { userId: 501 });

  assert.equal(added, true);
  assert.equal(addTransport.capturedRequest?.method, "POST");
  assert.equal(addTransport.capturedRequest?.path, "/users/501/likes/clips/add");
  assert.deepEqual(addTransport.capturedRequest?.query, {
    "clip-id": "clip/1",
  });
  assert.equal(addTransport.capturedRequest?.body, undefined);

  const removeTransport = new MockTransport(okResponse("ok"));
  const removeResource = new LikesResource(removeTransport);

  const removed = await removeResource.removeClip("clip/1", { userId: "owner/name" });

  assert.equal(removed, true);
  assert.equal(removeTransport.capturedRequest?.method, "POST");
  assert.equal(removeTransport.capturedRequest?.path, "/users/owner%2Fname/likes/clips/clip%2F1/remove");
  assert.equal(removeTransport.capturedRequest?.body, undefined);
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

test("likes resource propagates API errors from read endpoints", async () => {
  const transport = new MockTransport({
    body: {
      error: {
        name: "bad-request",
        message: "Invalid user",
      },
    },
    headers: {},
    status: 400,
    statusText: "Bad Request",
    url: "https://api.music.yandex.net/users/501/likes/tracks",
  });
  const resource = new LikesResource(transport);

  await assert.rejects(
    async () => resource.likedTracks(501),
    BadRequestError,
  );
});
