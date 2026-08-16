/**
 * Prototype-only "current session" stand-ins — there is no real auth
 * yet (see AGENTS.md §9), so screens that would normally scope data to
 * the logged-in organization use these instead.
 * TODO: derive from auth context once real auth exists.
 */
export const CURRENT_SUPPLIER_ORG_ID = "org-pet-solutions";

/** See CURRENT_SUPPLIER_ORG_ID above — same prototype stand-in, for
 * manufacturer-side screens (Stage 3+). */
export const CURRENT_MANUFACTURER_ORG_ID = "org-coca-cola";

/**
 * Fixed "today" for the prototype so date-relative mock data (e.g.
 * evidence expiration windows) is deterministic across runs. Chosen to
 * line up with the sample evidence dates seeded in
 * /lib/mock-data/evidence.ts.
 */
export const MOCK_TODAY = new Date("2026-08-15T00:00:00Z");
