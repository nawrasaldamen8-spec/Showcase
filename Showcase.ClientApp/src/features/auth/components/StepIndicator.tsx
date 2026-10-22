import React from "react";
import { Check } from "lucide-react";

export interface StepItem {
  number: number;
  label: string;
  sublabel?: string;
}

export interface StepIndicatorProps {
  currentStep: number;
  steps: StepItem[];
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, steps }) => {
  const currentStepItem =
    steps.find((s) => s.number === currentStep) ||
    steps[0] || { number: 1, label: "" };

  return (
    <div className="w-full pb-3 border-b border-stone/50 space-y-2.5">
      {/* Step Numbers & Connecting Track */}
      <div className="flex items-center justify-between relative px-0.5">
        {steps.map((step, index) => {
          const isCompleted = step.number < currentStep;
          const isCurrent = step.number === currentStep;

          return (
            <React.Fragment key={step.number}>
              {/* Connecting Line between steps */}
              {index > 0 && (
                <div
                  className={`flex-1 h-0.5 mx-1 transition-colors duration-300 ${
                    step.number <= currentStep ? "bg-[#2e7d32]" : "bg-stone/50"
                  }`}
                />
              )}

              {/* Step Node */}
              <div
                className={`h-7 w-7 rounded-full flex items-center justify-center font-gothic text-xs font-bold transition-all duration-300 select-none shrink-0 ${
                  isCompleted
                    ? "bg-[#2e7d32] text-ivory-light"
                    : isCurrent
                    ? "bg-clay text-ivory-light ring-4 ring-clay/20 scale-105"
                    : "bg-[#e8e5dc] text-cloud-dark"
                }`}
                aria-current={isCurrent ? "step" : undefined}
                title={step.label}
              >
                {isCompleted ? (
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                ) : (
                  step.number
                )}
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* Active Step Label Banner */}
      <div className="flex items-center justify-between px-0.5 text-xs font-gothic">
        <span className="font-bold uppercase tracking-wider text-slate-dark text-[11px] sm:text-xs">
          {currentStepItem.label}
        </span>
        {currentStepItem.sublabel && (
          <span className="text-[10px] sm:text-[11px] text-cloud-dark font-medium uppercase tracking-wider">
            {currentStepItem.sublabel}
          </span>
        )}
      </div>
    </div>
  );
};
