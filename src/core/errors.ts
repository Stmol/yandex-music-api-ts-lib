export interface YandexMusicErrorOptions {
  readonly cause?: unknown;
  readonly details?: unknown;
  readonly status?: number;
  readonly url?: string;
}

export class YandexMusicError extends Error {
  declare readonly cause: unknown;
  readonly details: unknown;
  readonly status: number | undefined;
  readonly url: string | undefined;

  constructor(message: string, options: YandexMusicErrorOptions = {}) {
    super(message, { cause: options.cause });
    this.name = new.target.name;
    this.details = options.details;
    this.status = options.status;
    this.url = options.url;
  }
}

export class TimeoutError extends YandexMusicError {}

export class AbortError extends YandexMusicError {}

export class NetworkError extends YandexMusicError {}

export class BadRequestError extends YandexMusicError {}

export class UnauthorizedError extends YandexMusicError {}

export class NotFoundError extends YandexMusicError {}

export class UnknownApiError extends YandexMusicError {}

export interface ApiSchemaErrorOptions extends YandexMusicErrorOptions {
  readonly expected: string;
  readonly path: string;
  readonly received: unknown;
}

export class ApiSchemaError extends YandexMusicError {
  readonly expected: string;
  readonly path: string;
  readonly received: unknown;

  constructor(message: string, options: ApiSchemaErrorOptions) {
    super(message, options);
    this.expected = options.expected;
    this.path = options.path;
    this.received = options.received;
  }
}
