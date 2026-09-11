"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/providers/toast-provider";

/**
 * Stage 7.4 — one row: the full public request link + a Copy button.
 * `path` is the relative route (e.g. `/request/pet-solutions`); the
 * absolute origin is only knowable client-side, so it's filled in
 * after mount (server render shows the relative path — same
 * safe-hydration pattern ToastProvider already uses elsewhere) so a
 * link pasted into an email actually resolves rather than being
 * relative to nothing.
 */
export function CopyLinkRow({
  path,
  copyLabel,
}: {
  path: string;
  copyLabel: string;
}) {
  const [origin, setOrigin] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    // window.location is only knowable client-side; same intentional
    // mount-deferred pattern ToastProvider uses for its own portal
    // mount-flag (see components/providers/toast-provider.tsx) — the
    // server/first-client render show the relative path only, so
    // there's no hydration mismatch, just a same-tick-later update.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional, see comment above
    setOrigin(window.location.origin);
  }, []);

  const fullUrl = `${origin}${path}`;

  async function handleCopy() {
    try {
      if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
        throw new Error("Clipboard access isn't available in this browser.");
      }
      await navigator.clipboard.writeText(fullUrl);
      toast({
        title: "Link copied",
        description: fullUrl,
        variant: "success",
      });
    } catch {
      toast({
        title: "Couldn't copy link automatically",
        description: `Copy it manually: ${fullUrl}`,
        variant: "destructive",
      });
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <code className="max-w-full overflow-x-auto whitespace-nowrap rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs text-slate-700">
        {fullUrl}
      </code>
      <Button type="button" variant="secondary" size="sm" onClick={handleCopy}>
        {copyLabel}
      </Button>
    </div>
  );
}
