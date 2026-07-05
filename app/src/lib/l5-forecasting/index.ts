/**
 * L5 · Forecasting & Econometrics — stub.
 * MVP: scenario sliders live in the app UI (export-control shock ×).
 * Trajectories are stored as grade-D claims. Zero ML by design (D3: L4 before L5).
 */
export interface EventShock {
  id: string;
  type: "export_restriction" | "launch_failure" | "subsidy_change";
  /** Multiplier applied to a named parameter, e.g. { param: "capexPerKw", factor: 1.25 } */
  impacts: { param: string; factor: number }[];
}

export function applyShocks<T extends Record<string, number>>(params: T, shocks: EventShock[]): T {
  const out = { ...params };
  for (const s of shocks)
    for (const i of s.impacts)
      if (i.param in out) (out as Record<string, number>)[i.param] *= i.factor;
  return out;
}
