import { ArrowLeft, ArrowRight, Globe, Save } from "lucide-react";
import React from "react";
import { Button } from "@shared/components/Button.tsx";
import type { WizardStepNumber } from "../hooks/usePostEditor.ts";

export interface WizardBottomBarProps {
  currentStep: WizardStepNumber;
  imagesCount: number;
  isSaving: boolean;
  isPublishing: boolean;
  isCurrentlyPublished: boolean;
  onPrevStep: () => void;
  onCancelClick: (e?: React.MouseEvent) => void;
  onNextStep: () => void;
  onSaveDraft: () => void;
  onPublishWork: () => void;
}

export const WizardBottomBar: React.FC<WizardBottomBarProps> = ({
  currentStep,
  imagesCount,
  isSaving,
  isPublishing,
  isCurrentlyPublished,
  onPrevStep,
  onCancelClick,
  onNextStep,
  onSaveDraft,
  onPublishWork,
}) => {
  return (
    <div className="sticky bottom-4 z-30 mt-8 sm:mt-10 bg-[#faf9f5]/95 backdrop-blur-md border border-[#cccbc8] rounded-2xl sm:rounded-[24px] p-3.5 sm:p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 shadow-none">
      <div className="order-2 sm:order-1 flex items-center">
        {currentStep > 1 ? (
          <Button
            variant="outline"
            size="md"
            onClick={onPrevStep}
            leftIcon={<ArrowLeft className="h-4 w-4" />}
            disabled={isSaving || isPublishing}
            className="w-full sm:w-auto justify-center"
          >
            Previous
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="md"
            onClick={onCancelClick}
            disabled={isSaving || isPublishing}
            className="w-full sm:w-auto justify-center"
          >
            Cancel
          </Button>
        )}
      </div>

      <div className="order-1 sm:order-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
        {currentStep < 4 ? (
          <Button
            variant="slate"
            size="md"
            onClick={onNextStep}
            rightIcon={<ArrowRight className="h-4 w-4" />}
            disabled={isSaving || isPublishing}
            className="w-full sm:w-auto justify-center"
          >
            Continue
          </Button>
        ) : (
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
            <Button
              variant="slate"
              size="md"
              isLoading={isSaving}
              disabled={isPublishing}
              onClick={onSaveDraft}
              leftIcon={<Save className="h-4 w-4" />}
              className="w-full sm:w-auto justify-center"
            >
              Save as Draft
            </Button>
            <Button
              variant="clay"
              size="md"
              isLoading={isPublishing}
              disabled={isSaving || imagesCount === 0}
              onClick={onPublishWork}
              leftIcon={<Globe className="h-4 w-4" />}
              className="w-full sm:w-auto justify-center"
            >
              {isCurrentlyPublished ? "Update & Publish" : "Publish Project"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
