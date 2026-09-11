"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/providers/toast-provider";
import { removeComponentAction } from "@/lib/packaging/actions";

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
}

/**
 * Lets a manufacturer undo adding a component by mistake — there's no
 * draft state to back out of otherwise (addPackagingComponent commits
 * immediately). Works the same for native and external components;
 * neither card needs to know anything beyond the ids. An inline
 * confirm step (rather than removing on the first click) guards
 * against a stray misclick actually being the thing that causes the
 * mistake this button exists to fix.
 *
 * Removing does NOT delete any DataRequest/DataApproval history raised
 * against this component (see mockPackagingService.removeComponent) —
 * only that those records now refer to a component that no longer
 * exists on this packaging item.
 */
export function RemoveComponentButton({
  componentId,
  packagingItemId,
  componentLabel,
}: {
  componentId: string;
  packagingItemId: string;
  /** Used only in the confirmation copy/toast — whatever the card
   * already has on hand (product name, or the role as a fallback). */
  componentLabel: string;
}) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();

  function handleConfirm() {
    startTransition(async () => {
      try {
        await removeComponentAction(componentId, packagingItemId);
        toast({
          title: "Component removed",
          description: `${componentLabel} was removed from this packaging item.`,
          variant: "success",
        });
        // The card itself lives inside the server-rendered component
        // list on this page — router.refresh() re-fetches that list
        // (now revalidated by the action) so the removed card
        // disappears immediately, without a full page reload.
        router.refresh();
      } catch (error) {
        toast({
          title: "Couldn't remove component",
          description: getErrorMessage(error),
          variant: "destructive",
        });
        setIsConfirming(false);
      }
    });
  }

  if (isConfirming) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-slate-600">Remove this component?</span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setIsConfirming(false)}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={handleConfirm}
          disabled={isPending}
        >
          {isPending ? "Removing…" : "Confirm Remove"}
        </Button>
      </div>
    );
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={() => setIsConfirming(true)}
      title="Remove this component from the packaging item"
    >
      Remove Component
    </Button>
  );
}
