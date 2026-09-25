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
    <div className="sticky bottom-4 z-30 mt-10 bg-[#faf9f5]/95 backdrop-blur-md border border-[#cccbc8] rounded-[24px] p-4 sm:p-5 flex items-center justify-between gap-4 shadow-none">
      <div>
        {currentStep > 1 ? (
          <Button
            variant="outline"
            size="md"
            onClick={onPrevStep}
            leftIcon={<ArrowLeft className="h-4 w-4" />}
            disabled={isSaving || isPublishing}
          >
            Previous
          </Button>
        ) : (
          <Button variant="ghost" size="md" onClick={onCancelClick} disabled={isSaving || isPublishing}>
            Cancel
          </Button>
        )}
      </div>

      <div className="flex items-center gap-3">
        {currentStep < 4 ? (
          <Button
            variant="slate"
            size="md"
            onClick={onNextStep}
            rightIcon={<ArrowRight className="h-4 w-4" />}
            disabled={isSaving || isPublishing}
          >
            Continue
          </Button>
        ) : (
          <div className="flex items-center gap-3">
            <Button
              variant="slate"
              size="md"
              isLoading={isSaving}
              disabled={isPublishing}
              onClick={onSaveDraft}
              leftIcon={<Save className="h-4 w-4" />}
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
            >
              {isCurrentlyPublished ? "Update & Publish" : "Publish Work"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
