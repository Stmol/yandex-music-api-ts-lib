import type { HttpTransport, SupportedLanguage } from "../http/types.ts";
import { MusicHistory } from "../models/history/MusicHistory.ts";
import { MusicHistoryItems } from "../models/history/MusicHistoryItems.ts";
import { parseObjectResult } from "./parsing.ts";

export interface MusicHistoryOptions {
  readonly fullModelsCount?: number;
  readonly language?: SupportedLanguage;
}

export interface MusicHistoryItemsOptions {
  readonly albumIds?: readonly (number | string)[];
  readonly artistIds?: readonly (number | string)[];
  readonly playlistIds?: readonly MusicHistoryPlaylistId[];
  readonly trackIds?: readonly MusicHistoryTrackId[];
  readonly waveSeeds?: readonly (readonly string[])[];
}

export interface MusicHistoryPlaylistId {
  readonly kind: number | string;
  readonly uid: number | string;
}

export interface MusicHistoryTrackId {
  readonly albumId: number | string;
  readonly trackId: number | string;
}

interface MusicHistoryRequestItem {
  readonly type: string;
  readonly data: {
    readonly itemId: Record<string, unknown>;
  };
}

function createHistoryItem(type: string, itemId: Record<string, unknown>): MusicHistoryRequestItem {
  return {
    data: {
      itemId,
    },
    type,
  };
}

function buildHistoryItems(options: MusicHistoryItemsOptions): readonly MusicHistoryRequestItem[] {
  return [
    ...(options.trackIds ?? []).map((item) =>
      createHistoryItem("track", {
        albumId: String(item.albumId),
        trackId: String(item.trackId),
      })),
    ...(options.albumIds ?? []).map((id) =>
      createHistoryItem("album", {
        id: String(id),
      })),
    ...(options.artistIds ?? []).map((id) =>
      createHistoryItem("artist", {
        id: String(id),
      })),
    ...(options.playlistIds ?? []).map((item) =>
      createHistoryItem("playlist", {
        kind: Number(item.kind),
        uid: Number(item.uid),
      })),
    ...(options.waveSeeds ?? []).map((seeds) =>
      createHistoryItem("wave", {
        seeds,
      })),
  ];
}

export class HistoryResource {
  private readonly transport: HttpTransport;

  constructor(transport: HttpTransport) {
    this.transport = transport;
  }

  async musicHistory(options: MusicHistoryOptions = {}): Promise<MusicHistory> {
    const response = await this.transport.request({
      method: "GET",
      path: "/music-history",
      query: {
        fullModelsCount: options.fullModelsCount,
        lang: options.language,
      },
    });

    return MusicHistory.fromJSON(parseObjectResult(response));
  }

  async musicHistoryItems(options: MusicHistoryItemsOptions = {}): Promise<MusicHistoryItems> {
    const response = await this.transport.request({
      body: JSON.stringify({
        items: buildHistoryItems(options),
      }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      path: "/music-history/items",
    });

    return MusicHistoryItems.fromJSON(parseObjectResult(response));
  }
}
