/**
 * L1 · Claim Substrate — the single source of truth.
 * Every layer reads/writes claims; nothing bypasses L1.
 * MVP: flat JSON files in /data/claims, git history = version lineage.
 * GREAT (later): SQLite/DuckDB claim graph, typed edges, staleness decay.
 */

export type Grade = "A" | "B" | "C" | "D";
export type Access = "public" | "restricted";
export type ClaimStatus = "active" | "superseded" | "contested";

export interface Source {
  id: string;
  type: "doc" | "paper" | "web" | "expert";
  title: string;
  url?: string;
  /** Updated in hindsight by L2-GREAT calibration loop. */
  reliability_score?: number;
}

export interface Claim {
  id: string;
  module: string; // "sbsp" | "compute" | ...
  statement: string;
  value: number;
  unit: string;
  grade: Grade;
  /** [low, high] — the range a reasonable expert could contest. */
  contest_range: [number, number];
  access: Access;
  status: ClaimStatus;
  sources: Source[];
  /** Display name for L7 views (defaults to statement). */
  short_name?: string;
  /** One-line rationale for the contest range — shown on parameter cards. */
  why_contested?: string;
  /** Whether the dashboard enables this parameter by default. */
  enabled_by_default?: boolean;
  /** Manual for MVP; L2-GREAT auto-suggests. */
  contradicts?: string[];
  supersedes?: string[];
  last_reviewed: string; // ISO date
}

export function validateClaim(c: Claim): string[] {
  const errors: string[] = [];
  if (!c.id) errors.push("missing id");
  if (!["A", "B", "C", "D"].includes(c.grade)) errors.push(`bad grade: ${c.grade}`);
  if (c.contest_range[0] > c.contest_range[1]) errors.push("inverted contest_range");
  if (c.value < c.contest_range[0] || c.value > c.contest_range[1])
    errors.push("value outside contest_range");
  if (c.sources.length === 0 && c.grade !== "D") errors.push("graded claim needs a source");
  return errors;
}

/** Grade-C claims older than this auto-flag for re-verification (L1-GREAT seed). */
export const STALENESS_MONTHS: Record<Grade, number> = { A: 24, B: 12, C: 6, D: 3 };

export function isStale(c: Claim, now = new Date()): boolean {
  const months = STALENESS_MONTHS[c.grade];
  const reviewed = new Date(c.last_reviewed);
  return now.getTime() - reviewed.getTime() > months * 30 * 86400_000;
}
