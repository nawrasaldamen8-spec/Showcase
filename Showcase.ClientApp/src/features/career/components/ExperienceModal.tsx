import { Briefcase, X } from "lucide-react";
import React, { useState } from "react";
import type { CareerExperience } from "@shared/types/index.ts";
import { ExperienceStep1 } from "./ExperienceStep1.tsx";
import { ExperienceStep2 } from "./ExperienceStep2.tsx";

export interface ExperienceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<CareerExperience, "id" | "createdAt">) => Promise<void>;
  initialData?: CareerExperience | null;
  isSaving?: boolean;
}

const ExperienceModalForm: React.FC<Omit<ExperienceModalProps, "isOpen">> = ({
  onClose,
  onSave,
  initialData,
  isSaving = false,
}) => {
  const [step, setStep] = useState<1 | 2>(1);

  // Mandatory fields (Step 1)
  const [company, setCompany] = useState(initialData?.company || "");
  const [jobTitle, setJobTitle] = useState(initialData?.jobTitle || "");
  const [startDate, setStartDate] = useState(initialData?.startDate || "");

  // Additional fields (Step 2)
  const [endDate, setEndDate] = useState(initialData?.endDate || "");
  const [currentlyWorking, setCurrentlyWorking] = useState(!!initialData?.currentlyWorking);
  const [employmentType, setEmploymentType] = useState(initialData?.employmentType || "Full-time");
  const [location, setLocation] = useState(initialData?.location || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [achievements, setAchievements] = useState(initialData?.achievements || "");
  const [skillsText, setSkillsText] = useState(initialData?.skillsUsed?.join(", ") || "");

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (field?: string) => {
    const errs: Record<string, string> = { ...errors };

    if (!field || field === "company") {
      if (!company.trim()) errs.company = "Company or Studio name is needed to proceed.";
      else delete errs.company;
    }
    if (!field || field === "jobTitle") {
      if (!jobTitle.trim()) errs.jobTitle = "Role or Job Title is needed to proceed.";
      else delete errs.jobTitle;
    }
    if (!field || field === "startDate") {
      if (!startDate.trim()) errs.startDate = "Start date is needed (YYYY-MM).";
      else delete errs.startDate;
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validate(field);
  };

  const handleContinue = (e: React.MouseEvent) => {
    e.preventDefault();
    setTouched({ company: true, jobTitle: true, startDate: true });
    if (!validate()) return;
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ company: true, jobTitle: true, startDate: true });
    if (!validate()) {
      setStep(1);
      return;
    }

    const skillsUsed = skillsText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    await onSave({
      company: company.trim(),
      jobTitle: jobTitle.trim(),
      startDate: startDate.trim(),
      endDate: currentlyWorking ? undefined : endDate.trim() || undefined,
      currentlyWorking,
      employmentType: employmentType.trim() || undefined,
      location: location.trim() || undefined,
      description: description.trim() || undefined,
      achievements: achievements.trim() || undefined,
      skillsUsed: skillsUsed.length > 0 ? skillsUsed : undefined,
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
          <Briefcase className="w-5 h-5 stroke-[1.75]" />
        </div>
        <div>
          <span className="font-gothic text-xs font-bold uppercase tracking-[0.2em] text-[#87867f] block">
            Career Trajectory • Step {step} of 2
          </span>
          <h2 id="experience-modal-title" className="font-gothic text-xl font-bold uppercase tracking-tight text-[#141413]">
            {initialData ? "Edit Position" : "Record Position"}
          </h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {step === 1 ? (
          <ExperienceStep1
            company={company}
            setCompany={setCompany}
            jobTitle={jobTitle}
            setJobTitle={setJobTitle}
            startDate={startDate}
            setStartDate={setStartDate}
            touched={touched}
            errors={errors}
            validate={validate}
            handleBlur={handleBlur}
            onCancel={onClose}
            onContinue={handleContinue}
            isSaving={isSaving}
          />
        ) : (
          <ExperienceStep2
            employmentType={employmentType}
            setEmploymentType={setEmploymentType}
            location={location}
            setLocation={setLocation}
            endDate={endDate}
            setEndDate={setEndDate}
            currentlyWorking={currentlyWorking}
            setCurrentlyWorking={setCurrentlyWorking}
            description={description}
            setDescription={setDescription}
            achievements={achievements}
            setAchievements={setAchievements}
            skillsText={skillsText}
            setSkillsText={setSkillsText}
            onBack={() => setStep(1)}
            isSaving={isSaving}
            isEditing={Boolean(initialData)}
          />
        )}
      </form>
    </div>
  );
};

export const ExperienceModal: React.FC<ExperienceModalProps> = ({
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
      aria-labelledby="experience-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#141413]/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150"
    >
      <ExperienceModalForm
        key={initialData?.id || "new-exp"}
        onClose={onClose}
        onSave={onSave}
        initialData={initialData}
        isSaving={isSaving}
      />
    </div>
  );
};
