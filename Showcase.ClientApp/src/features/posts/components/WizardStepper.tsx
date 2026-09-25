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
  return (
    <div className="pb-6 border-b border-[#cccbc8]">
      <div className="flex items-center justify-between gap-4 mb-4">
        <button
          type="button"
          onClick={onCancelClick}
          className="inline-flex items-center gap-2 font-gothic text-xs font-semibold uppercase tracking-[0.10em] text-[#87867f] hover:text-[#141413] transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Return to Studio</span>
        </button>

        <div className="flex items-center gap-3">
          {isEditing && <PostStatusBadge status={postStatus} size="sm" />}
          <span className="font-gothic text-[11px] font-bold uppercase tracking-wider text-[#87867f]">
            Step {currentStep} of 4
          </span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 sm:gap-4 items-center">
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
              className={`group flex flex-col text-left py-1.5 px-1 transition-all ${
                isAccessible ? "cursor-pointer" : "cursor-not-allowed opacity-40"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`h-5 w-5 rounded-full flex items-center justify-center font-gothic text-[10px] font-bold transition-all shrink-0 ${
                    isCurrent
                      ? "bg-[#141413] text-[#faf9f5]"
                      : isCompleted
                        ? "bg-[#cccbc8] text-[#141413]"
                        : "bg-[#e8e5dc] text-[#87867f]"
                  }`}
                >
                  {isCompleted ? <Check className="h-3 w-3" /> : s.step}
                </span>
                <span
                  className={`font-gothic text-[11px] font-semibold uppercase tracking-[0.12em] truncate transition-colors ${
                    isCurrent
                      ? "text-[#141413]"
                      : isCompleted
                        ? "text-[#141413]/70 group-hover:text-[#141413]"
                        : "text-[#87867f]"
                  }`}
                >
                  {s.label}
                </span>
              </div>
              <div
                className={`h-1 w-full rounded-full transition-all duration-300 ${
                  isCurrent ? "bg-[#141413]" : isCompleted ? "bg-[#cccbc8]" : "bg-[#cccbc8]/30"
                }`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
};
