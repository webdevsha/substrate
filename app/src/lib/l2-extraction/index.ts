/**
 * L2 · Extraction & Corroboration — stub.
 * MVP shape: LLM extracts claim *candidates* from documents; a human grades and signs
 * everything before it becomes an L1 claim (the human gate is architectural — D2).
 * IP rule (hard, D4): restricted claims run only via Anthropic API or local Ollama.
 */
import type { Claim } from "../l1-claims/schema";

export interface ClaimCandidate extends Omit<Claim, "grade" | "status"> {
  suggested_grade?: Claim["grade"];
  extracted_from: string; // source doc id
}

/** Placeholder — will call Claude with a strict JSON claim-candidate schema. */
export async function extractCandidates(_docText: string): Promise<ClaimCandidate[]> {
  throw new Error("L2 extraction not yet wired — run extraction sessions manually (Phase-0 pattern)");
}

/** Placeholder — one web-search corroboration per claim → tighten/widen/within + named source. */
export async function corroborate(_claim: Claim): Promise<{ verdict: "tighten" | "widen" | "within"; source: string }> {
  throw new Error("L2 corroboration not yet wired");
}
