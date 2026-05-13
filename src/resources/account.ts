import type { JsonObject } from "../core/json.ts";
import type { SupportedLanguage, HttpTransport } from "../http/types.ts";
import { parseYandexApiResponse } from "../http/response.ts";
import { Status } from "../models/account/Status.ts";

export interface AccountStatusOptions {
  readonly language?: SupportedLanguage;
}

function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export class AccountResource {
  private readonly transport: HttpTransport;

  constructor(transport: HttpTransport) {
    this.transport = transport;
  }

  async status(options: AccountStatusOptions = {}): Promise<Status> {
    const response = await this.transport.request({
      method: "GET",
      path: "/users/account/status",
      query: {
        lang: options.language,
      },
    });
    const result = parseYandexApiResponse<unknown>(response);

    return Status.fromJSON(isJsonObject(result) ? result : {});
  }
}
