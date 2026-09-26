import { Globe } from "lucide-react";
import React from "react";
import { Input } from "@shared/components/Input.tsx";

export interface WizardStepIdentityProps {
  title: string;
  setTitle: (val: string) => void;
  titleError: string | null;
  setTitleError: (msg: string | null) => void;
  externalUrl: string;
  setExternalUrl: (val: string) => void;
  urlError: string | null;
  setUrlError: (msg: string | null) => void;
  setIsDirty: (dirty: boolean) => void;
}

export const WizardStepIdentity: React.FC<WizardStepIdentityProps> = ({
  title,
  setTitle,
  titleError,
  setTitleError,
  externalUrl,
  setExternalUrl,
  urlError,
  setUrlError,
  setIsDirty,
}) => {
  return (
    <div className="bg-[#faf9f5] border border-[#cccbc8] rounded-[24px] p-6 sm:p-8 space-y-6">
      <div>
        <Input
          label="Project Title *"
          placeholder="e.g., Pority Platform Redesign or AI Analytics Engine"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setIsDirty(true);
            if (titleError) setTitleError(null);
          }}
          errorMessage={titleError || undefined}
          helperText="A clear and descriptive title for your project (minimum 3 characters)."
        />
      </div>

      <div>
        <Input
          label="Live Link or Repository (Optional)"
          placeholder="https://example.com or https://github.com/..."
          value={externalUrl}
          onChange={(e) => {
            setExternalUrl(e.target.value);
            setIsDirty(true);
            if (urlError) setUrlError(null);
          }}
          leftIcon={<Globe className="h-4 w-4" />}
          errorMessage={urlError || undefined}
          helperText="Optional link to a live demo, website, or code repository."
        />
      </div>
    </div>
  );
};
