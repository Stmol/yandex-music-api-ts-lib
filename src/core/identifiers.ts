export type ArtistId = string | number;
export type CoverSize = string;
export type PlaylistKind = string | number;
export type TrackId = string | number;
export type UserId = string | number;

export function encodePathSegment(value: string | number): string {
  return encodeURIComponent(String(value));
}

export function joinIds(values: readonly (string | number)[]): string {
  return values.map(String).join(",");
}
