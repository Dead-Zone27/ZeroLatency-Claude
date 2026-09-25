/** Returns `base` with every id between positions `a` and `b` (inclusive, either order) set to `on`. */
export function selectRange(base: ReadonlySet<string>, ordered: readonly string[], a: number, b: number, on: boolean): Set<string> {
  const next = new Set(base);
  const [lo, hi] = a <= b ? [a, b] : [b, a];
  for (let i = Math.max(0, lo); i <= Math.min(ordered.length - 1, hi); i++) {
    const id = ordered[i]!;
    if (on) next.add(id); else next.delete(id);
  }
  return next;
}
