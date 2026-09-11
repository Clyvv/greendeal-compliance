"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/providers/toast-provider";
import { inviteSupplierAction } from "@/lib/packaging/actions";

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
}

/**
 * Original requirements doc §11: "This product is not currently
 * maintained by the supplier in Greendeal. [Invite Supplier]" —
 * simulated only (API_CONTRACT.md's mockExternalSupplierService.inviteSupplier).
 * Deliberately does NOT build the claim/onboarding flow a real invite
 * would eventually trigger (out of scope for this stage) — success is
 * just a toast confirmation, nothing about the ExternalSupplierProduct
 * record changes.
 */
export function InviteSupplierButton({
  externalSupplierProductId,
  defaultEmail,
}: {
  externalSupplierProductId: string;
  defaultEmail?: string;
}) {
  const [email, setEmail] = useState(defaultEmail ?? "");
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  function handleInvite() {
    const trimmed = email.trim();
    if (!trimmed) {
      toast({
        title: "Email required",
        description: "Enter the supplier's email address to send an invite.",
        variant: "destructive",
      });
      return;
    }
    startTransition(async () => {
      try {
        await inviteSupplierAction(externalSupplierProductId, trimmed);
        toast({
          title: "Invitation sent",
          description: `Invitation sent to ${trimmed}.`,
          variant: "success",
        });
      } catch (error) {
        toast({
          title: "Couldn't send invitation",
          description: getErrorMessage(error),
          variant: "destructive",
        });
      }
    });
  }

  return (
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
        onClick={handleInvite}
        disabled={isPending}
      >
        {isPending ? "Sending…" : "Invite Supplier"}
      </Button>
    </div>
  );
}
