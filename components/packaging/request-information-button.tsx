"use client";

import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/providers/toast-provider";
import { requestInformationFromSupplierAction } from "@/lib/packaging/actions";
import type { RequestInformationResult } from "@/lib/services/mockExternalSupplierService";

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
}

/**
 * Stage 7.10 — replaces Stage 7.3's "Invite Supplier" button
 * (components/packaging/invite-supplier-button.tsx, removed). Instead
 * of a bare toast confirmation, this opens a Dialog that shows the
 * exact simulated email Greendeal Compliance would send (no real email
 * is ever sent — see mockExternalSupplierService.requestInformationFromSupplier)
 * plus a Copy Link button for the public, unauthenticated
 * `/supplier-response/{token}` page a real supplier would land on.
 */
export function RequestInformationButton({
  externalSupplierProductId,
  packagingItemId,
  defaultEmail,
  responseStatus,
}: {
  externalSupplierProductId: string;
  packagingItemId: string;
  defaultEmail?: string;
  responseStatus: "NOT_SENT" | "SENT" | "COMPLETED";
}) {
  const [email, setEmail] = useState(defaultEmail ?? "");
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<RequestInformationResult | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [origin, setOrigin] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    // window.location is only knowable client-side — same
    // mount-deferred pattern components/public-request/copy-link-row.tsx
    // already uses, so a link shown in the dialog actually resolves
    // rather than being relative to nothing.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional, see comment above
    setOrigin(window.location.origin);
  }, []);

  function handleRequest() {
    const trimmed = email.trim();
    if (!trimmed) {
      toast({
        title: "Email required",
        description: "Enter the supplier's email address to request information.",
        variant: "destructive",
      });
      return;
    }
    startTransition(async () => {
      try {
        const requestResult = await requestInformationFromSupplierAction(
          externalSupplierProductId,
          packagingItemId,
          trimmed
        );
        setResult(requestResult);
        setDialogOpen(true);
      } catch (error) {
        toast({
          title: "Couldn't request information",
          description: getErrorMessage(error),
          variant: "destructive",
        });
      }
    });
  }

  const fullResponseUrl = result ? `${origin}${result.responseUrl}` : "";
  const emailBody = result?.email.body.replace("{{RESPONSE_LINK}}", fullResponseUrl);

  async function handleCopyLink() {
    if (!fullResponseUrl) return;
    try {
      if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
        throw new Error("Clipboard access isn't available in this browser.");
      }
      await navigator.clipboard.writeText(fullResponseUrl);
      toast({
        title: "Link copied",
        description: fullResponseUrl,
        variant: "success",
      });
    } catch {
      toast({
        title: "Couldn't copy link automatically",
        description: `Copy it manually: ${fullResponseUrl}`,
        variant: "destructive",
      });
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <div className="w-full max-w-xs">
          <Input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="supplier@example.com"
            disabled={isPending}
            aria-label="Supplier email address"
          />
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleRequest}
          disabled={isPending}
        >
          {isPending
            ? "Sending…"
            : responseStatus === "NOT_SENT"
              ? "Request Information from Supplier"
              : "Resend Request"}
        </Button>
      </div>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="Information request sent"
        description="This is a prototype — no real email is sent. Below is exactly what would be delivered to the supplier."
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
              <Label htmlFor="response-link-field">Response link</Label>
              <code
                id="response-link-field"
                className="block w-full overflow-x-auto whitespace-nowrap rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700"
              >
                {fullResponseUrl}
              </code>
            </div>
          </div>
        )}
      </Dialog>
    </>
  );
}
