/** True when profile signals include an Open to work marker from Future Jobs. */
export function isOpenToWork(signals: readonly string[] | null | undefined): boolean {
  if (!signals?.length) return false;
  return signals.some((signal) => /open to work/i.test(signal));
}
