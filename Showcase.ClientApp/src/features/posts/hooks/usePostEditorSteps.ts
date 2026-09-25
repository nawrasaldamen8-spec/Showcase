import { useState } from "react";

export type WizardStepNumber = 1 | 2 | 3 | 4;

export function usePostEditorSteps(validateStep: (step: WizardStepNumber) => boolean) {
  const [currentStep, setCurrentStep] = useState<WizardStepNumber>(1);
  const [maxReachedStep, setMaxReachedStep] = useState<WizardStepNumber>(1);

  const handleNextStep = () => {
    if (!validateStep(currentStep)) return;
    const next = Math.min(4, currentStep + 1) as WizardStepNumber;
    setCurrentStep(next);
    if (next > maxReachedStep) setMaxReachedStep(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as WizardStepNumber);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleJumpToStep = (targetStep: WizardStepNumber) => {
    if (targetStep <= maxReachedStep) {
      setCurrentStep(targetStep);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return {
    currentStep,
    setCurrentStep,
    maxReachedStep,
    setMaxReachedStep,
    handleNextStep,
    handlePrevStep,
    handleJumpToStep,
  };
}
