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
    <div className="fixed sm:sticky bottom-0 left-0 right-0 sm:bottom-4 z-30 sm:mt-10 bg-ivory-light/95 backdrop-blur-md border-t sm:border border-stone sm:rounded-card p-3 sm:p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-4 shadow-none">
      <div className="order-2 sm:order-1 flex items-center">
        {currentStep > 1 ? (
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onPrevStep}
            leftIcon={<ArrowLeft className="h-4 w-4" />}
            disabled={isSaving || isPublishing}
            className="w-full sm:w-auto justify-center font-gothic text-xs uppercase tracking-wider min-h-[46px]"
          >
            Previous
          </Button>
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="md"
            onClick={onCancelClick}
            disabled={isSaving || isPublishing}
            className="w-full sm:w-auto justify-center font-gothic text-xs uppercase tracking-wider text-cloud-dark hover:text-slate-dark min-h-[46px]"
          >
            Cancel
          </Button>
        )}
      </div>

      <div className="order-1 sm:order-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
        {currentStep < 5 ? (
          <Button
            type="button"
            variant="clay"
            size="md"
            onClick={onNextStep}
            rightIcon={<ArrowRight className="h-4 w-4" />}
            disabled={isSaving || isPublishing}
            className="w-full sm:w-auto justify-center font-gothic text-xs uppercase tracking-wider min-h-[46px]"
          >
            Continue
          </Button>
        ) : (
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <Button
              type="button"
              variant="slate"
              size="md"
              isLoading={isSaving}
              disabled={isPublishing}
              onClick={onSaveDraft}
              leftIcon={<Save className="h-4 w-4" />}
              className="w-full sm:w-auto justify-center font-gothic text-xs uppercase tracking-wider min-h-[46px]"
            >
              Save as Draft
            </Button>
            <Button
              type="button"
              variant="clay"
              size="md"
              isLoading={isPublishing}
              disabled={isSaving || imagesCount === 0}
              onClick={onPublishWork}
              leftIcon={<Globe className="h-4 w-4" />}
              className="w-full sm:w-auto justify-center font-gothic text-xs uppercase tracking-wider min-h-[46px]"
            >
              {isCurrentlyPublished ? "Update & Publish" : "Publish Project"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
