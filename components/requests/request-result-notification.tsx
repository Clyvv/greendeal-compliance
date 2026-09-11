"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/providers/toast-provider";
import { generateRequestResultAction } from "@/lib/requests/actions";
import type { GenerateRequestResultResult } from "@/lib/services/mockRequestService";

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
}

/**
 * Stage 7.12 — Request Result Link notification, for a
 * PUBLIC_REQUEST_LINK-origin request only. Same pattern as
 * components/packaging/request-information-button.tsx (Stage 7.10): a
 * Dialog showing the exact simulated email (no real email is ever
 * sent) plus a Copy Link button, backed by a token-generating server
 * action that's safe to call repeatedly (it reuses the existing token
 * rather than minting a new one).
 *
 * Two ways this opens:
 * - Automatically, once, right after the request is approved in this
 *   session (`autoTrigger` flips true — see
 *   components/requests/data-request-approval-flow.tsx's handleApprove).
 * - Manually, any time after, via the always-visible "View Notification
 *   Email" button — e.g. if the supplier closed the dialog before
 *   copying the link, or is revisiting an already-approved request.
 */
export function RequestResultNotification({
  requestId,
  autoTrigger,
}: {
  requestId: string;
  autoTrigger: boolean;
}) {
  const [result, setResult] = useState<GenerateRequestResultResult | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [origin, setOrigin] = useState("");
  const hasAutoTriggeredRef = useRef(false);
  const { toast } = useToast();

  useEffect(() => {
    // window.location is only knowable client-side — same
    // mount-deferred pattern components/packaging/request-information-button.tsx
    // already uses, so a link shown in the dialog actually resolves
    // rather than being relative to nothing.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional, see comment above
    setOrigin(window.location.origin);
  }, []);

  function generate() {
    startTransition(async () => {
      try {
        const generated = await generateRequestResultAction(requestId);
        setResult(generated);
        setDialogOpen(true);
      } catch (error) {
        toast({
          title: "Couldn't generate the result link",
          description: getErrorMessage(error),
          variant: "destructive",
        });
      }
    });
  }

  useEffect(() => {
    // Fires exactly once per approval — autoTrigger flips true right
    // when the parent's approve action succeeds, never again on a
    // later reload of an already-approved request (the ref guards
    // against StrictMode's double-invoke too).
    if (autoTrigger && !hasAutoTriggeredRef.current) {
      hasAutoTriggeredRef.current = true;
      generate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- generate() intentionally excluded; it's stable enough for this one-shot effect and including it would re-run on every render
  }, [autoTrigger]);

  function handleViewNotification() {
    // Reuse whatever we already generated this session rather than
    // calling the server again for no reason; if this is a fresh page
    // load for an already-approved request, generate() below still
    // reuses the existing resultToken server-side either way.
    if (result) {
      setDialogOpen(true);
      return;
    }
    generate();
  }

  const fullResultUrl = result ? `${origin}${result.resultUrl}` : "";
  const emailBody = result?.email.body.replace("{{RESULT_LINK}}", fullResultUrl);

  async function handleCopyLink() {
    if (!fullResultUrl) return;
    try {
      if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
        throw new Error("Clipboard access isn't available in this browser.");
      }
      await navigator.clipboard.writeText(fullResultUrl);
      toast({
        title: "Link copied",
        description: fullResultUrl,
        variant: "success",
      });
    } catch {
      toast({
        title: "Couldn't copy link automatically",
        description: `Copy it manually: ${fullResultUrl}`,
        variant: "destructive",
      });
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={handleViewNotification}
        disabled={isPending}
      >
        {isPending ? "Loading…" : "View Notification Email"}
      </Button>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="Requester notified"
        description="This is a prototype — no real email is sent. Below is exactly what would be delivered to the requester."
        footer={
          <>
            <Button type="button" variant="secondary" onClick={handleCopyLink}>
              Copy Link
            </Button>
            <Button type="button" onClick={() => setDialogOpen(false)}>
              Close
            </Button>
          </>
        }
      >
        {result && (
          <div className="space-y-3">
            <div className="space-y-1 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm">
              <p>
                <span className="font-medium text-slate-700">To:</span>{" "}
                {result.email.to}
              </p>
              <p>
                <span className="font-medium text-slate-700">From:</span>{" "}
                {result.email.from}
              </p>
              <p>
                <span className="font-medium text-slate-700">Subject:</span>{" "}
                {result.email.subject}
              </p>
              <pre className="mt-2 whitespace-pre-wrap font-sans text-sm text-slate-700">
                {emailBody}
              </pre>
            </div>
            <div>
              <Label htmlFor="result-link-field">Result link</Label>
              <code
                id="result-link-field"
                className="block w-full overflow-x-auto whitespace-nowrap rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700"
              >
                {fullResultUrl}
              </code>
            </div>
          </div>
        )}
      </Dialog>
    </>
  );
}
