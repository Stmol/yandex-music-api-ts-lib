export function assignModelShape<TShape extends Record<string, unknown>>(
  target: object,
  shape: TShape,
): void {
  Object.assign(target, shape);
}
