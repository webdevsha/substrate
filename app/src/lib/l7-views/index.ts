/**
 * L7 · Presentation & Narrative.
 * MVP: the built dashboard lives at /app (public/app/index.html — the shipped v3).
 * GREAT: view registry where any view binds to any module exposing the contract;
 * audience-mode exports (investor / client / engineering). Fable deferred post-L4 (D5).
 */
export const VIEWS = [
  { id: "dashboard", path: "/app/", audience: "engineering", status: "built" },
  { id: "homepage", path: "/", audience: "all", status: "built" },
] as const;
