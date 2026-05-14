import { encodePathSegment } from "../core/identifiers.ts";
import type { HttpTransport, SupportedLanguage } from "../http/types.ts";
import { Status } from "../models/account/Status.ts";
import { Dashboard } from "../models/radio/Dashboard.ts";
import { StationResult } from "../models/radio/StationResult.ts";
import { StationTracksResult } from "../models/radio/StationTracksResult.ts";
import { parseObjectArrayResult, parseObjectResult } from "./parsing.ts";

export type RadioStationId = string | number;

export interface RadioAccountStatusOptions {
  readonly language?: SupportedLanguage;
}

export interface RadioStationsDashboardOptions {
  readonly language?: SupportedLanguage;
}

export interface RadioStationsListOptions {
  readonly language?: SupportedLanguage;
}

export interface RadioStationInfoOptions {
  readonly language?: SupportedLanguage;
}

export interface RadioStationTracksOptions {
  readonly language?: SupportedLanguage;
  readonly queue?: string | number;
  readonly settings2?: boolean;
}

export class RadioResource {
  private readonly transport: HttpTransport;

  constructor(transport: HttpTransport) {
    this.transport = transport;
  }

  async accountStatus(options: RadioAccountStatusOptions = {}): Promise<Status> {
    const response = await this.transport.request({
      method: "GET",
      path: "/rotor/account/status",
      query: {
        lang: options.language,
      },
    });

    return Status.fromJSON(parseObjectResult(response));
  }

  async stationsDashboard(
    options: RadioStationsDashboardOptions = {},
  ): Promise<Dashboard> {
    const response = await this.transport.request({
      method: "GET",
      path: "/rotor/stations/dashboard",
      query: {
        lang: options.language,
      },
    });

    return Dashboard.fromJSON(parseObjectResult(response));
  }

  async stationsList(
    options: RadioStationsListOptions = {},
  ): Promise<readonly StationResult[]> {
    const response = await this.transport.request({
      method: "GET",
      path: "/rotor/stations/list",
      query: {
        language: options.language,
      },
    });

    return parseObjectArrayResult(response, (entry) => StationResult.fromJSON(entry));
  }

  async stationInfo(
    station: RadioStationId,
    options: RadioStationInfoOptions = {},
  ): Promise<readonly StationResult[]> {
    const response = await this.transport.request({
      method: "GET",
      path: `/rotor/station/${encodePathSegment(station)}/info`,
      query: {
        lang: options.language,
      },
    });

    return parseObjectArrayResult(response, (entry) => StationResult.fromJSON(entry));
  }

  async stationTracks(
    station: RadioStationId,
    options: RadioStationTracksOptions = {},
  ): Promise<StationTracksResult> {
    const response = await this.transport.request({
      method: "GET",
      path: `/rotor/station/${encodePathSegment(station)}/tracks`,
      query: {
        lang: options.language,
        queue: options.queue,
        settings2: options.settings2,
      },
    });

    return StationTracksResult.fromJSON(parseObjectResult(response));
  }
}
