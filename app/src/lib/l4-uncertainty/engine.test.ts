import { describe, expect, test } from "bun:test";
import type { Claim } from "../l1-claims/schema";
import { claimInterval, rankVoi, monteCarlo } from "./engine";

const mk = (id: string, grade: Claim["grade"], value: number, range: [number, number]): Claim => ({
  id, module: "test", statement: id, value, unit: "x", grade,
  contest_range: range, access: "public", status: "active",
  sources: [{ id: "s", type: "web", title: "t" }], last_reviewed: "2026-06-01",
});

describe("L4 uncertainty engine", () => {
  test("grade A interval is tighter than grade C", () => {
    const [aLo, aHi] = claimInterval(mk("a", "A", 100, [0, 1000]));
    const [cLo, cHi] = claimInterval(mk("c", "C", 100, [0, 1000]));
    expect(aHi - aLo).toBeLessThan(cHi - cLo);
  });

  test("grade D uses full contest range", () => {
    expect(claimInterval(mk("d", "D", 100, [10, 900]))).toEqual([10, 900]);
  });

  test("VOI ranks the wide D claim above the tight A claim", () => {
    const claims = [mk("tight", "A", 100, [0, 1000]), mk("wide", "D", 100, [10, 900])];
    const rows = rankVoi(claims, (v) => v["tight"] + v["wide"]);
    expect(rows[0].claimId).toBe("wide");
    expect(rows[0].share).toBeGreaterThan(0.5);
  });

  test("Monte Carlo quantiles bracket the median", () => {
    const claims = [mk("x", "C", 100, [0, 1000])];
    const mc = monteCarlo(claims, (v) => v["x"], 2000);
    expect(mc.p05).toBeLessThanOrEqual(mc.p50);
    expect(mc.p50).toBeLessThanOrEqual(mc.p95);
  });
});
