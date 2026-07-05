/**
 * L1 → L7 binding: serializes the claim registry into the dashboard's
 * parameter shape, grouped by module. The instrument at /app fetches this
 * instead of trusting its hardcoded presets — the substrate is the truth.
 */
import type { APIRoute } from "astro";
import { loadClaims } from "../../lib/l1-claims/store";

export const GET: APIRoute = () => {
  const byModule: Record<string, object[]> = {};
  for (const c of loadClaims().filter((x) => x.status === "active" && x.access === "public")) {
    (byModule[c.module] ??= []).push({
      id: c.id,
      n: c.short_name ?? c.statement,
      u: c.unit,
      lo: c.contest_range[0],
      hi: c.contest_range[1],
      def: c.value,
      g: c.grade,
      w: c.why_contested ?? c.statement,
      on: c.enabled_by_default ?? true,
    });
  }
  return new Response(JSON.stringify(byModule), {
    headers: { "Content-Type": "application/json" },
  });
};
