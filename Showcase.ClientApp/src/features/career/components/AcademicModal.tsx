import { GraduationCap, X } from "lucide-react";
import React, { useState } from "react";
import type { CareerAcademic } from "@shared/types/index.ts";
import { AcademicStep1 } from "./AcademicStep1.tsx";
import { AcademicStep2 } from "./AcademicStep2.tsx";

export interface AcademicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<CareerAcademic, "id" | "createdAt">) => Promise<void>;
  initialData?: CareerAcademic | null;
  isSaving?: boolean;
}

const AcademicModalForm: React.FC<Omit<AcademicModalProps, "isOpen">> = ({
  onClose,
  onSave,
  initialData,
  isSaving = false,
}) => {
  const [step, setStep] = useState<1 | 2>(1);

  // Mandatory fields (Step 1)
  const [institution, setInstitution] = useState(initialData?.institution || "");
  const [degree, setDegree] = useState(initialData?.degree || "");
  const [fieldOfStudy, setFieldOfStudy] = useState(initialData?.fieldOfStudy || "");
  const [startDate, setStartDate] = useState(initialData?.startDate || "");

  // Additional fields (Step 2)
  const [endDate, setEndDate] = useState(initialData?.endDate || "");
  const [currentlyStudying, setCurrentlyStudying] = useState(!!initialData?.currentlyStudying);
  const [location, setLocation] = useState(initialData?.location || "");
  const [gpa, setGpa] = useState(initialData?.gpa || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [achievements, setAchievements] = useState(initialData?.achievements || "");

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (field?: string) => {
    const errs: Record<string, string> = { ...errors };

    if (!field || field === "institution") {
      if (!institution.trim()) errs.institution = "Academic institution is needed to proceed.";
      else delete errs.institution;
    }
    if (!field || field === "degree") {
      if (!degree.trim()) errs.degree = "Degree or Diploma is needed to proceed.";
      else delete errs.degree;
    }
    if (!field || field === "fieldOfStudy") {
      if (!fieldOfStudy.trim()) errs.fieldOfStudy = "Field of study is needed to proceed.";
      else delete errs.fieldOfStudy;
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
    setTouched({ institution: true, degree: true, fieldOfStudy: true, startDate: true });
    if (!validate()) return;
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ institution: true, degree: true, fieldOfStudy: true, startDate: true });
    if (!validate()) {
      setStep(1);
      return;
    }

    await onSave({
      institution: institution.trim(),
      degree: degree.trim(),
      fieldOfStudy: fieldOfStudy.trim(),
      startDate: startDate.trim(),
      endDate: currentlyStudying ? undefined : endDate.trim() || undefined,
      currentlyStudying,
      location: location.trim() || undefined,
      gpa: gpa.trim() || undefined,
      description: description.trim() || undefined,
      achievements: achievements.trim() || undefined,
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
          <GraduationCap className="w-5 h-5 stroke-[1.75]" />
        </div>
        <div>
          <span className="font-gothic text-xs font-bold uppercase tracking-[0.2em] text-[#87867f] block">
            Academic Background • Step {step} of 2
          </span>
          <h2 id="academic-modal-title" className="font-gothic text-xl font-bold uppercase tracking-tight text-[#141413]">
            {initialData ? "Edit Academic Record" : "Add Academic Record"}
          </h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {step === 1 ? (
          <AcademicStep1
            institution={institution}
            setInstitution={setInstitution}
            degree={degree}
            setDegree={setDegree}
            fieldOfStudy={fieldOfStudy}
            setFieldOfStudy={setFieldOfStudy}
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
          <AcademicStep2
            endDate={endDate}
            setEndDate={setEndDate}
            currentlyStudying={currentlyStudying}
            setCurrentlyStudying={setCurrentlyStudying}
            location={location}
            setLocation={setLocation}
            gpa={gpa}
            setGpa={setGpa}
            description={description}
            setDescription={setDescription}
            achievements={achievements}
            setAchievements={setAchievements}
            onBack={() => setStep(1)}
            isSaving={isSaving}
            isEditing={Boolean(initialData)}
          />
        )}
      </form>
    </div>
  );
};

export const AcademicModal: React.FC<AcademicModalProps> = ({
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
      aria-labelledby="academic-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#141413]/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150"
    >
      <AcademicModalForm
        key={initialData?.id || "new-acad"}
        onClose={onClose}
        onSave={onSave}
        initialData={initialData}
        isSaving={isSaving}
      />
    </div>
  );
};
