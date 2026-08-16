"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/loading-state";
import { useToast } from "@/components/providers/toast-provider";
import { runAssessmentAction } from "@/lib/assessments/actions";

// The original spec's script for the processing sequence — shown one
// at a time, briefly, before advancing. Purely a client-side narration
// of "work happening"; it isn't tied to the mock service's own
// (separate, brief) PROCESSING -> COMPLETE delay — see
// mockAssessmentService.runAssessment's comment.
const PROCESSING_STEPS = [
  "Preparing assessment...",
  "Validating supplier data...",
  "Checking data validity...",
  "Checking evidence...",
  "Calculating material composition...",
  "Calculating recycled content...",
  "Evaluating compliance...",
  "Finalizing assessment...",
];

// Total ~2.8s — "a few seconds is enough" per this stage's prompt,
// this is UX demonstration, not a realistic processing time.
const STEP_DURATION_MS = 350;

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
}

export function RunAssessmentButton({
  packagingItemId,
}: {
  packagingItemId: string;
}) {
  const [isRunning, setIsRunning] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [, startTransition] = useTransition();
  const stepTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      if (stepTimerRef.current) clearInterval(stepTimerRef.current);
    };
  }, []);

  function handleRunAssessment() {
    setIsRunning(true);
    setStepIndex(0);

    stepTimerRef.current = setInterval(() => {
      setStepIndex((previous) => Math.min(previous + 1, PROCESSING_STEPS.length - 1));
    }, STEP_DURATION_MS);

    // Guarantees the full step narration plays out at least once,
    // regardless of how fast the (mocked) server action actually
    // resolves — see this component's top comment.
    const minimumDisplayTime = new Promise<void>((resolve) =>
      setTimeout(resolve, STEP_DURATION_MS * PROCESSING_STEPS.length)
    );

    startTransition(async () => {
      try {
        const [assessment] = await Promise.all([
          runAssessmentAction(packagingItemId),
          minimumDisplayTime,
        ]);
        if (stepTimerRef.current) clearInterval(stepTimerRef.current);
        router.push(`/manufacturer/assessments/${assessment.id}`);
      } catch (error) {
        if (stepTimerRef.current) clearInterval(stepTimerRef.current);
        setIsRunning(false);
        toast({
          title: "Couldn't run assessment",
          description: getErrorMessage(error),
          variant: "destructive",
        });
      }
    });
  }

  if (isRunning) {
    return (
      <div className="w-full">
        <LoadingState label={PROCESSING_STEPS[stepIndex]} />
        <p className="text-center text-xs text-slate-400">
          Step {stepIndex + 1} of {PROCESSING_STEPS.length}
        </p>
      </div>
    );
  }

  return (
    <Button type="button" onClick={handleRunAssessment}>
      Run PPWR Assessment
    </Button>
  );
}
