import { cn } from "@/lib/utils";

export const WIZARD_STEP_LABELS = [
  "Identification",
  "Physical & Structural",
  "Circularity & PPWR",
  "Chemical Safety",
  "Specialized Domain",
  "Evidence & Governance",
  "Review & Publish",
] as const;

export function WizardStepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        Step {currentStep} of {WIZARD_STEP_LABELS.length}
      </p>
      <ol className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2">
        {WIZARD_STEP_LABELS.map((label, index) => {
          const stepNumber = index + 1;
          const isCurrent = stepNumber === currentStep;
          const isComplete = stepNumber < currentStep;
          return (
            <li key={label} className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium",
                  isCurrent
                    ? "border-emerald-700 bg-emerald-700 text-white"
                    : isComplete
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-slate-300 bg-white text-slate-500"
                )}
              >
                {isComplete ? "✓" : stepNumber}
              </span>
              <span
                className={cn(
                  "hidden text-xs font-medium sm:inline",
                  isCurrent ? "text-slate-900" : "text-slate-500"
                )}
              >
                {label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
