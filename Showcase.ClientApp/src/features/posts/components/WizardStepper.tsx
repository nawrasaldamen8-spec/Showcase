import { ArrowLeft, Check } from "lucide-react";
import React from "react";
import { WIZARD_STEPS } from "../constants.ts";
import type { WizardStepNumber } from "../hooks/usePostEditor.ts";
import { PostStatusBadge } from "./PostStatusBadge.tsx";

export interface WizardStepperProps {
  currentStep: WizardStepNumber;
  maxReachedStep: WizardStepNumber;
  postStatus: number;
  isEditing: boolean;
  onCancelClick: (e?: React.MouseEvent) => void;
  onJumpToStep: (step: WizardStepNumber) => void;
}

export const WizardStepper: React.FC<WizardStepperProps> = ({
  currentStep,
  maxReachedStep,
  postStatus,
  isEditing,
  onCancelClick,
  onJumpToStep,
}) => {
  const currentStepMeta = WIZARD_STEPS.find((s) => s.step === currentStep) ?? WIZARD_STEPS[0] ?? {
    step: 1 as WizardStepNumber,
    label: "Step",
    title: "Details",
    description: "",
  };

  return (
    <div className="pb-6 border-b border-stone/60 space-y-4">
      {/* Top Bar: Return link & Status Badge */}
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onCancelClick}
          className="inline-flex items-center gap-2 font-gothic text-xs font-semibold uppercase tracking-[0.10em] text-cloud-dark hover:text-slate-dark transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Return to Studio</span>
        </button>

        <div className="flex items-center gap-3">
          {isEditing && <PostStatusBadge status={postStatus} size="sm" />}
          <span className="font-gothic text-[11px] font-bold uppercase tracking-wider text-clay">
            Step {currentStep} of {WIZARD_STEPS.length}
          </span>
        </div>
      </div>

      {/* Stepper Grid (Responsive: 5 Columns) */}
      <div
        className="grid gap-2 sm:gap-3 items-center"
        style={{ gridTemplateColumns: `repeat(${WIZARD_STEPS.length}, minmax(0, 1fr))` }}
      >
        {WIZARD_STEPS.map((s) => {
          const isCurrent = currentStep === s.step;
          const isCompleted = currentStep > s.step;
          const isAccessible = s.step <= maxReachedStep;

          return (
            <button
              key={s.step}
              type="button"
              disabled={!isAccessible}
              onClick={() => onJumpToStep(s.step)}
              className={`group flex flex-col text-left py-1.5 px-0.5 sm:px-1 transition-all ${
                isAccessible ? "cursor-pointer" : "cursor-not-allowed opacity-40"
              }`}
              aria-current={isCurrent ? "step" : undefined}
            >
              <div className="flex items-center gap-1.5 sm:gap-2 mb-2 min-w-0">
                <span
                  className={`h-5 w-5 sm:h-6 sm:w-6 rounded-full flex items-center justify-center font-gothic text-[10px] sm:text-xs font-bold transition-all shrink-0 ${
                    isCurrent
                      ? "bg-slate-dark text-ivory-light ring-2 ring-slate-dark/20"
                      : isCompleted
                        ? "bg-[#2e7d32] text-ivory-light"
                        : "bg-[#e8e5dc] text-cloud-dark"
                  }`}
                >
                  {isCompleted ? <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> : s.step}
                </span>
                <span
                  className={`font-gothic text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.06em] sm:tracking-[0.10em] truncate transition-colors hidden sm:inline ${
                    isCurrent
                      ? "text-slate-dark"
                      : isCompleted
                        ? "text-slate-dark/70 group-hover:text-slate-dark"
                        : "text-cloud-dark"
                  }`}
                >
                  {s.label}
                </span>
              </div>
              <div
                className={`h-1.5 w-full rounded-full transition-all duration-300 ${
                  isCurrent ? "bg-slate-dark" : isCompleted ? "bg-[#2e7d32]" : "bg-stone/40"
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* Mobile-only Step Context Indicator */}
      <div className="sm:hidden flex items-center justify-between text-xs font-gothic pt-1">
        <span className="font-bold uppercase tracking-wider text-slate-dark truncate">
          {currentStepMeta.label}: {currentStepMeta.title}
        </span>
      </div>
    </div>
  );
};
