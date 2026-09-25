import { Trophy, X } from "lucide-react";
import React, { useState } from "react";
import type { CareerAchievement } from "@shared/types/index.ts";
import { AchievementStep1 } from "./AchievementStep1.tsx";
import { AchievementStep2 } from "./AchievementStep2.tsx";

export interface AchievementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<CareerAchievement, "id" | "createdAt">) => Promise<void>;
  initialData?: CareerAchievement | null;
  isSaving?: boolean;
}


const AchievementModalForm: React.FC<Omit<AchievementModalProps, "isOpen">> = ({
  onClose,
  onSave,
  initialData,
  isSaving = false,
}) => {
  const [step, setStep] = useState<1 | 2>(1);

  // Mandatory fields (Step 1)
  const [title, setTitle] = useState(initialData?.title || "");
  const [type, setType] = useState(initialData?.type || "Award");

  // Additional fields (Step 2)
  const [date, setDate] = useState(initialData?.date || "");
  const [organization, setOrganization] = useState(initialData?.organization || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [url, setUrl] = useState(initialData?.url || "");
  const [mediaUrl, setMediaUrl] = useState(initialData?.mediaUrl || "");

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!title.trim()) {
      errs.title = "Achievement title is needed to proceed.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleBlur = () => {
    setTouched((prev) => ({ ...prev, title: true }));
    validate();
  };

  const handleContinue = (e: React.MouseEvent) => {
    e.preventDefault();
    setTouched({ title: true });
    if (!validate()) return;
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ title: true });
    if (!validate()) {
      setStep(1);
      return;
    }

    await onSave({
      title: title.trim(),
      type: type.trim() || undefined,
      date: date.trim() || undefined,
      organization: organization.trim() || undefined,
      description: description.trim() || undefined,
      url: url.trim() || undefined,
      mediaUrl: mediaUrl.trim() || undefined,
    });
  };

  return (
    <div className="relative w-full max-w-xl my-8 rounded-[24px] bg-[#faf9f5] border border-[#cccbc8] p-6 sm:p-8 shadow-none text-[#141413]">
      <button
        type="button"
        onClick={onClose}
        disabled={isSaving}
        className="absolute top-6 right-6 text-[#87867f] hover:text-[#141413] transition-colors cursor-pointer"
        aria-label="Close dialog"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-[#f0eee6] border border-[#cccbc8]/60 flex items-center justify-center text-[#141413]">
          <Trophy className="w-5 h-5 stroke-[1.75]" />
        </div>
        <div>
          <span className="font-gothic text-xs font-bold uppercase tracking-[0.2em] text-[#87867f] block">
            Editorial Recognition • Step {step} of 2
          </span>
          <h2 id="achievement-modal-title" className="font-gothic text-xl font-bold uppercase tracking-tight text-[#141413]">
            {initialData ? "Edit Achievement" : "Honor / Milestone"}
          </h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {step === 1 ? (
          <AchievementStep1
            title={title}
            setTitle={setTitle}
            type={type}
            setType={setType}
            touched={touched}
            errors={errors}
            validate={validate}
            handleBlur={handleBlur}
            onCancel={onClose}
            onContinue={handleContinue}
            isSaving={isSaving}
          />
        ) : (
          <AchievementStep2
            organization={organization}
            setOrganization={setOrganization}
            date={date}
            setDate={setDate}
            url={url}
            setUrl={setUrl}
            mediaUrl={mediaUrl}
            setMediaUrl={setMediaUrl}
            description={description}
            setDescription={setDescription}
            onBack={() => setStep(1)}
            isSaving={isSaving}
            isEditing={Boolean(initialData)}
          />
        )}
      </form>
    </div>
  );
};

export const AchievementModal: React.FC<AchievementModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  isSaving = false,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="achievement-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#141413]/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150"
    >
      <AchievementModalForm
        key={initialData?.id || "new-achieve"}
        onClose={onClose}
        onSave={onSave}
        initialData={initialData}
        isSaving={isSaving}
      />
    </div>
  );
};
