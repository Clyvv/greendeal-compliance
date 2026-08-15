"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/providers/toast-provider";
import {
  WIZARD_STEP_LABELS,
  WizardStepIndicator,
} from "./wizard-step-indicator";
import { Step1Identification } from "./wizard-steps/step-1-identification";
import { Step2Physical } from "./wizard-steps/step-2-physical";
import { Step3Circularity } from "./wizard-steps/step-3-circularity";
import { Step4ChemicalSafety } from "./wizard-steps/step-4-chemical-safety";
import { Step5SpecializedDomain } from "./wizard-steps/step-5-specialized-domain";
import { Step6Evidence } from "./wizard-steps/step-6-evidence";
import { Step7Review } from "./wizard-steps/step-7-review";
import {
  createInitialWizardFormState,
  type ProductWizardFormState,
} from "@/lib/wizard/types";
import {
  calculateCompletenessPercent,
  PUBLISH_COMPLETENESS_THRESHOLD,
} from "@/lib/wizard/completeness";
import {
  createAndPublishProductAction,
  createDraftProductAction,
} from "@/lib/wizard/actions";

const TOTAL_STEPS = WIZARD_STEP_LABELS.length;

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
}

export function ProductWizard() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<ProductWizardFormState>(() =>
    createInitialWizardFormState()
  );
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();

  const completeness = useMemo(
    () => calculateCompletenessPercent(form),
    [form]
  );

  function updateField<K extends keyof ProductWizardFormState>(
    key: K,
    value: ProductWizardFormState[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const canGoNext =
    step === 1 ? form.name.trim().length > 0 && form.sku.trim().length > 0 : true;

  function handleBack() {
    setStep((current) => Math.max(1, current - 1));
  }

  function handleNext() {
    if (!canGoNext) return;
    setStep((current) => Math.min(TOTAL_STEPS, current + 1));
  }

  function handleSaveDraft() {
    startTransition(async () => {
      try {
        const result = await createDraftProductAction(form);
        toast({
          title: "Draft saved",
          description: `${form.name || "Product"} was saved as a draft.`,
          variant: "success",
        });
        router.push(`/supplier/products/${result.productId}`);
      } catch (error) {
        toast({
          title: "Couldn't save draft",
          description: getErrorMessage(error),
          variant: "destructive",
        });
      }
    });
  }

  function handlePublish() {
    if (completeness < PUBLISH_COMPLETENESS_THRESHOLD) return;
    startTransition(async () => {
      try {
        const result = await createAndPublishProductAction(form);
        toast({
          title: "Product published",
          description: `${form.name || "Product"} is now published.`,
          variant: "success",
        });
        router.push(`/supplier/products/${result.productId}`);
      } catch (error) {
        toast({
          title: "Couldn't publish product",
          description: getErrorMessage(error),
          variant: "destructive",
        });
      }
    });
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">
          Create Product
        </h1>
        <p className="text-sm text-slate-500">
          Add a new supplier product compliance profile.
        </p>
      </div>

      <Card>
        <CardHeader>
          <WizardStepIndicator currentStep={step} />
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <Step1Identification form={form} onFieldChange={updateField} />
          )}
          {step === 2 && (
            <Step2Physical form={form} onFieldChange={updateField} />
          )}
          {step === 3 && (
            <Step3Circularity form={form} onFieldChange={updateField} />
          )}
          {step === 4 && (
            <Step4ChemicalSafety form={form} onFieldChange={updateField} />
          )}
          {step === 5 && (
            <Step5SpecializedDomain form={form} onFieldChange={updateField} />
          )}
          {step === 6 && (
            <Step6Evidence form={form} onFieldChange={updateField} />
          )}
          {step === 7 && (
            <Step7Review form={form} completeness={completeness} />
          )}
        </CardContent>
        <CardFooter className="flex flex-wrap items-center justify-between gap-3">
          <div>
            {step === 1 ? (
              <Link href="/supplier/products">
                <Button variant="ghost" type="button" disabled={isPending}>
                  Cancel
                </Button>
              </Link>
            ) : (
              <Button
                variant="secondary"
                type="button"
                onClick={handleBack}
                disabled={isPending}
              >
                Back
              </Button>
            )}
          </div>

          {step < TOTAL_STEPS ? (
            <div className="text-right">
              <Button type="button" onClick={handleNext} disabled={!canGoNext}>
                Next
              </Button>
              {!canGoNext && (
                <p className="mt-1 text-xs text-slate-500">
                  Enter a product name and SKU to continue.
                </p>
              )}
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="secondary"
                type="button"
                onClick={handleSaveDraft}
                disabled={isPending}
              >
                {isPending ? "Saving…" : "Save Draft"}
              </Button>
              <div className="text-right">
                <Button
                  type="button"
                  onClick={handlePublish}
                  disabled={isPending || completeness < PUBLISH_COMPLETENESS_THRESHOLD}
                >
                  {isPending ? "Publishing…" : "Publish Product"}
                </Button>
                {completeness < PUBLISH_COMPLETENESS_THRESHOLD && (
                  <p className="mt-1 text-xs text-slate-500">
                    Reach {PUBLISH_COMPLETENESS_THRESHOLD}% completeness to
                    publish (currently {completeness}%).
                  </p>
                )}
              </div>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
