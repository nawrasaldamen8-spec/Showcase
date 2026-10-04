import React from "react";
import { Check } from "lucide-react";

export interface StepItem {
  number: number;
  label: string;
  sublabel: string;
}

export interface StepIndicatorProps {
  currentStep: number;
  steps: StepItem[];
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, steps }) => {
  const currentStepItem = steps.find((s) => s.number === currentStep) || steps[0] || { number: 1, label: "", sublabel: "" };

  return (
    <div className="w-full pt-3 sm:pt-0 pb-5 border-b border-stone/60 space-y-3">
      {/* Step Numbers & Track */}
      <div
        className="grid gap-2 items-center"
        style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}
      >
        {steps.map((step) => {
          const isCompleted = step.number < currentStep;
          const isCurrent = step.number === currentStep;

          return (
            <div key={step.number} className="flex flex-col items-center text-center group">
              <div className="flex items-center w-full">
                <div
                  className={`h-7 w-7 sm:h-8 sm:w-8 mx-auto rounded-full flex items-center justify-center font-gothic text-[11px] sm:text-xs font-bold transition-all duration-200 select-none ${
                    isCompleted
                      ? "bg-[#2e7d32] text-ivory-light"
                      : isCurrent
                      ? "bg-clay text-ivory-light ring-4 ring-clay/20 scale-105"
                      : "bg-[#e8e5dc] text-cloud-dark"
                  }`}
                  aria-current={isCurrent ? "step" : undefined}
                >
                  {isCompleted ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" /> : step.number}
                </div>
              </div>

              {/* Desktop-only step titles */}
              <div className="mt-1.5 hidden sm:block">
                <p
                  className={`font-gothic text-[10px] md:text-[11px] font-bold uppercase tracking-wider leading-tight truncate max-w-[80px] ${
                    isCurrent ? "text-slate-dark" : "text-cloud-dark"
                  }`}
                >
                  {step.label}
                </p>
                <span className="font-serif text-[9px] md:text-[10px] text-cloud-dark/80 block mt-0.5 truncate max-w-[80px]">
                  {step.sublabel}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile-only Step Status Bar */}
      <div className="sm:hidden flex items-center justify-between px-1 pt-1 font-gothic text-xs">
        <span className="font-bold uppercase tracking-wider text-clay">
          Step {currentStep} of {steps.length}
        </span>
        <span className="font-semibold uppercase tracking-wider text-slate-dark">
          {currentStepItem.label}
        </span>
      </div>
    </div>
  );
};
