/**
 * L3 · Simulation / Model Registry — SBSP LCOE model.
 * Pure function: params → outputs. Fixtures live in sbsp.test.ts; CI fails if they break.
 * GREAT (later): typed contract binding inputs to claim IDs, unit checking, correlated Monte Carlo.
 */

export interface SbspParams {
  launchCostPerKg: number; // $/kg  ← claim sbsp-launch-001
  satCostPerKw: number; // $/kW    ← claim sbsp-sat-002
  massPerKw: number; // kg/kW
  transmissionEfficiency: number; // 0–1
  capacityFactor: number; // 0–1
  lifetimeYears: number;
  discountRate: number; // 0–1
}

export interface SbspOutputs {
  capexPerKw: number; // $/kW delivered
  lcoe: number; // $/MWh
}

export function sbspModel(p: SbspParams): SbspOutputs {
  const launchPerKw = p.launchCostPerKg * p.massPerKw;
  const capexPerKw = (launchPerKw + p.satCostPerKw) / p.transmissionEfficiency;
  // Annualized capex via capital recovery factor
  const r = p.discountRate;
  // At r→0 the CRF limit is 1/n (straight-line recovery)
  const crf =
    r < 1e-9 ? 1 / p.lifetimeYears : (r * (1 + r) ** p.lifetimeYears) / ((1 + r) ** p.lifetimeYears - 1);
  const annualCost = capexPerKw * crf; // $/kW/yr
  const mwhPerKwYr = (8760 * p.capacityFactor) / 1000;
  return { capexPerKw, lcoe: annualCost / mwhPerKwYr };
}

export const DEFAULT_PARAMS: SbspParams = {
  launchCostPerKg: 1500,
  satCostPerKw: 2000,
  massPerKw: 5,
  transmissionEfficiency: 0.5,
  capacityFactor: 0.95,
  lifetimeYears: 25,
  discountRate: 0.07,
};

/** Brute-force one-at-a-time sensitivity sweep — the poor-man's tornado (feeds L4). */
export function sensitivity(
  base: SbspParams,
  ranges: Partial<Record<keyof SbspParams, [number, number]>>,
): { param: string; low: number; high: number; swing: number }[] {
  return Object.entries(ranges)
    .map(([param, [lo, hi]]) => {
      const low = sbspModel({ ...base, [param]: lo }).lcoe;
      const high = sbspModel({ ...base, [param]: hi }).lcoe;
      return { param, low, high, swing: Math.abs(high - low) };
    })
    .sort((a, b) => b.swing - a.swing);
}
