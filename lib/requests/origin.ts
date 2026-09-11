import type { DataRequest, RequestOrigin } from "@/lib/types";

/**
 * Stage 7.6 — the Stage 4/5 seed data (dr-1/2/3) predates the `origin`
 * field entirely (it's optional — see lib/types/data-request.ts), but
 * those requests are genuinely the native Greendeal-to-Greendeal
 * scenario, so an absent `origin` defaults to GREENDEAL here rather
 * than every reader needing its own fallback.
 */
export function getEffectiveOrigin(
  request: Pick<DataRequest, "origin">
): RequestOrigin {
  return request.origin ?? "GREENDEAL";
}

export const REQUEST_ORIGIN_LABELS: Record<RequestOrigin, string> = {
  GREENDEAL: "Greendeal Manufacturer Request",
  PUBLIC_REQUEST_LINK: "External Customer Request",
  // Reserved (DOMAIN.md §8a) — not produced by any flow yet.
  EXTERNAL: "External Request",
};
