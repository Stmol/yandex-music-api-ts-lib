function normalizeBooleanFlag(value: string | undefined): boolean {
  if (!value) {
    return false;
  }

  const normalized = value.trim().toLowerCase();

  return normalized === "1" || normalized === "true";
}

function readFirstEnvValue(...values: Array<string | undefined>): string | undefined {
  for (const value of values) {
    if (value?.trim()) {
      return value.trim();
    }
  }

  return undefined;
}

export const liveTestsEnabled = normalizeBooleanFlag(
  readFirstEnvValue(process.env.YANDEX_MUSIC_LIVE, process.env.YANDEX_MUSIC_LIVE_TESTS),
);
export const liveOauthToken = readFirstEnvValue(
  process.env.YANDEX_MUSIC_OAUTH_TOKEN,
  process.env.YANDEX_MUSIC_TOKEN,
);
export const liveMutationEnabled = normalizeBooleanFlag(process.env.YANDEX_MUSIC_LIVE_MUTATION);
export const configuredTestUserId = readFirstEnvValue(process.env.YANDEX_MUSIC_TEST_USER_ID);

export function requiredEnvSummary(): string {
  return [
    "Set env YANDEX_MUSIC_LIVE=1 npm run test:live",
    "Set YANDEX_MUSIC_OAUTH_TOKEN=<oauth token> for authenticated live checks",
    "Optionally set YANDEX_MUSIC_TEST_USER_ID=<uid> because account.status may not expose uid in live API responses",
    "Optionally set YANDEX_MUSIC_LIVE_MUTATION=1 for mutation smoke",
  ].join(". ");
}
