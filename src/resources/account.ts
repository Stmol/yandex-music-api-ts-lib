import type { SupportedLanguage, HttpTransport } from "../http/types.ts";
import { Status } from "../models/account/Status.ts";
import { parseObjectResult } from "./parsing.ts";

export interface AccountStatusOptions {
  readonly language?: SupportedLanguage;
}

export class AccountResource {
  private readonly transport: HttpTransport;

  constructor(transport: HttpTransport) {
    this.transport = transport;
  }

  async status(options: AccountStatusOptions = {}): Promise<Status> {
    const response = await this.transport.request({
      method: "GET",
      path: "/account/status",
      query: {
        lang: options.language,
      },
    });

    return Status.fromJSON(parseObjectResult(response));
  }
}
