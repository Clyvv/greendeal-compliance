import { Badge, type BadgeTone } from "@/components/ui/badge";
import { getEffectiveOrigin, REQUEST_ORIGIN_LABELS } from "@/lib/requests/origin";
import type { DataRequest, RequestOrigin } from "@/lib/types";

// Origin isn't one of AGENTS.md §4's sanctioned status concepts
// (complete/missing/pending/failed/not-authorized/not-applicable/
// expired) — it's a classification tag, so this uses Badge (the
// primitive already reserved for generic tags like "Draft"/"v1.0"),
// not StatusPill. `warning` for PUBLIC_REQUEST_LINK mirrors the same
// tone Stage 7.3's ExternalPackagingComponentCard already uses for
// "External Supplier Product" — external/less-verified things get the
// warning tone consistently across the app, not a new visual style.
const REQUEST_ORIGIN_TONES: Record<RequestOrigin, BadgeTone> = {
  GREENDEAL: "info",
  PUBLIC_REQUEST_LINK: "warning",
  EXTERNAL: "warning",
};

export function RequestOriginBadge({
  request,
}: {
  request: Pick<DataRequest, "origin">;
}) {
  const origin = getEffectiveOrigin(request);
  return (
    <Badge tone={REQUEST_ORIGIN_TONES[origin]}>
      {REQUEST_ORIGIN_LABELS[origin]}
    </Badge>
  );
}
