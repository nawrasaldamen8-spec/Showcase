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
  return (
    <div className="w-full pb-4 border-b border-[#cccbc8]/60">
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}
      >
        {steps.map((step) => {
          const isCompleted = step.number < currentStep;
          const isCurrent = step.number === currentStep;

          return (
            <div key={step.number} className="flex flex-col items-center text-center group">
              <div className="flex items-center w-full">
                <div
                  className={`h-7 w-7 mx-auto rounded-full flex items-center justify-center font-gothic text-xs font-bold transition-all duration-200 ${
                    isCompleted
                      ? "bg-[#2e7d32] text-[#faf9f5]"
                      : isCurrent
                      ? "bg-[#d97757] text-[#faf9f5] ring-4 ring-[#d97757]/20"
                      : "bg-[#e8e5dc] text-[#87867f]"
                  }`}
                >
                  {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : step.number}
                </div>
              </div>
              <div className="mt-1.5 hidden sm:block">
                <p
                  className={`font-gothic text-[10px] font-bold uppercase tracking-wider ${
                    isCurrent ? "text-[#141413]" : "text-[#87867f]"
                  }`}
                >
                  {step.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
