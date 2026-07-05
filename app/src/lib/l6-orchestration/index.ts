/**
 * L6 · Orchestration & Agents — deliberately empty for the 90-day window.
 * A human clicking "pull corroboration" is the orchestrator (per architecture §6).
 * GREAT: cron agents read L1 staleness flags + L4 VOI queue; all agent writes
 * land as candidates, never active claims. Will need the Cloudflare adapter + cron triggers.
 */
export const ORCHESTRATION_STATUS = "manual" as const;
