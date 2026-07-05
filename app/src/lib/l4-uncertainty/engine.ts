/**
 * L4 · Uncertainty Engine — the moat.
 * Grades become distributions, distributions propagate through models,
 * and the system ranks which unresolved claim is most worth resolving next (VOI).
 * MVP here: grade→width config + tornado-as-VOI. GREAT: Monte Carlo + formal VOI + calibration loop.
 */
import type { Claim, Grade } from "../l1-claims/schema";

/** MVP grade → heuristic relative width. D uses the full contest range. */
export const GRADE_WIDTH: Record<Grade, number> = { A: 0.05, B: 0.15, C: 0.4, D: 1.0 };

/** Turn a graded claim into a [low, high] interval for sweeps. */
export function claimInterval(c: Claim): [number, number] {
  if (c.grade === "D") return c.contest_range;
  const w = GRADE_WIDTH[c.grade];
  return [
    Math.max(c.value * (1 - w), c.contest_range[0]),
    Math.min(c.value * (1 + w), c.contest_range[1]),
  ];
}

/** Uniform sample from a claim's interval — seed for Monte Carlo (L4-GREAT will pick triangular/lognormal by claim type). */
export function sampleClaim(c: Claim, rand: () => number = Math.random): number {
  const [lo, hi] = claimInterval(c);
  return lo + rand() * (hi - lo);
}

export interface VoiRow {
  claimId: string;
  grade: Grade;
  /** Output swing when this claim alone moves across its interval. */
  swing: number;
  /** Share of total swing — the "resolve this next" ranking. */
  share: number;
}

/**
 * Naive VOI: one-at-a-time swings, ranked. The tornado *is* the poor-man's VOI.
 * `evaluate` maps claim values → the decision-relevant output (e.g. LCOE).
 */
export function rankVoi(claims: Claim[], evaluate: (values: Record<string, number>) => number): VoiRow[] {
  const base = Object.fromEntries(claims.map((c) => [c.id, c.value]));
  const rows = claims.map((c) => {
    const [lo, hi] = claimInterval(c);
    const swing = Math.abs(evaluate({ ...base, [c.id]: hi }) - evaluate({ ...base, [c.id]: lo }));
    return { claimId: c.id, grade: c.grade, swing };
  });
  const total = rows.reduce((s, r) => s + r.swing, 0) || 1;
  return rows
    .map((r) => ({ ...r, share: r.swing / total }))
    .sort((a, b) => b.swing - a.swing);
}

/**
 * Monte Carlo propagation (L4-GREAT seed): output distribution, not a point.
 * Independent draws for now — correlation matrix comes with the registry contract.
 */
export function monteCarlo(
  claims: Claim[],
  evaluate: (values: Record<string, number>) => number,
  n = 5000,
): { p05: number; p50: number; p95: number; samples: number } {
  const outs: number[] = [];
  for (let i = 0; i < n; i++) {
    outs.push(evaluate(Object.fromEntries(claims.map((c) => [c.id, sampleClaim(c)]))));
  }
  outs.sort((a, b) => a - b);
  const q = (p: number) => outs[Math.min(outs.length - 1, Math.floor(p * outs.length))];
  return { p05: q(0.05), p50: q(0.5), p95: q(0.95), samples: n };
}
