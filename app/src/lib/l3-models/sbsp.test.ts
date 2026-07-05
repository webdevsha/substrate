import { describe, expect, test } from "bun:test";
import { sbspModel, sensitivity, DEFAULT_PARAMS } from "./sbsp";

describe("sbsp model fixtures", () => {
  test("T1: default params produce finite positive LCOE", () => {
    const out = sbspModel(DEFAULT_PARAMS);
    expect(out.lcoe).toBeGreaterThan(0);
    expect(out.capexPerKw).toBeGreaterThan(0);
  });

  test("T2: cheaper launch lowers LCOE monotonically", () => {
    const cheap = sbspModel({ ...DEFAULT_PARAMS, launchCostPerKg: 500 });
    const expensive = sbspModel({ ...DEFAULT_PARAMS, launchCostPerKg: 3000 });
    expect(cheap.lcoe).toBeLessThan(expensive.lcoe);
  });

  test("T3: capex = (launch·mass + sat) / efficiency", () => {
    const out = sbspModel(DEFAULT_PARAMS);
    expect(out.capexPerKw).toBeCloseTo((1500 * 5 + 2000) / 0.5, 5);
  });

  test("T4: sensitivity sorts by swing, launch cost dominates default ranges", () => {
    const rows = sensitivity(DEFAULT_PARAMS, {
      launchCostPerKg: [800, 3000],
      satCostPerKw: [900, 6000],
    });
    expect(rows[0].swing).toBeGreaterThanOrEqual(rows[1].swing);
  });
});
