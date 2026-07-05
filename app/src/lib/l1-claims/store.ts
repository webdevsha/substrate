/** L1 loader — reads all claims from /data/claims at build time. */
import type { Claim } from "./schema";
import { validateClaim, isStale } from "./schema";

const files = import.meta.glob<{ default: Claim }>("../../../data/claims/*.json", {
  eager: true,
});

export function loadClaims(): Claim[] {
  return Object.values(files).map((m) => m.default);
}

export function claimById(id: string): Claim | undefined {
  return loadClaims().find((c) => c.id === id);
}

export function auditClaims() {
  const claims = loadClaims();
  return {
    total: claims.length,
    invalid: claims.map((c) => ({ id: c.id, errors: validateClaim(c) })).filter((r) => r.errors.length),
    stale: claims.filter((c) => isStale(c)).map((c) => c.id),
    restricted: claims.filter((c) => c.access === "restricted").length,
  };
}
