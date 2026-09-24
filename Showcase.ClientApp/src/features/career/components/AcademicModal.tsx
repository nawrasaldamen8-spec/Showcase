import { GraduationCap, X } from "lucide-react";
import React, { useState } from "react";
import { Button } from "../../../shared/components/Button.tsx";
import type { CareerAcademic } from "../../../shared/types/index.ts";

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
  const [institution, setInstitution] = useState(initialData?.institution || "");
  const [degree, setDegree] = useState(initialData?.degree || "");
  const [fieldOfStudy, setFieldOfStudy] = useState(initialData?.fieldOfStudy || "");
  const [startDate, setStartDate] = useState(initialData?.startDate || "");
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
      if (!institution.trim()) errs.institution = "Academic institution is required.";
      else delete errs.institution;
    }
    if (!field || field === "degree") {
      if (!degree.trim()) errs.degree = "Degree or Diploma is required.";
      else delete errs.degree;
    }
    if (!field || field === "fieldOfStudy") {
      if (!fieldOfStudy.trim()) errs.fieldOfStudy = "Field of study is required.";
      else delete errs.fieldOfStudy;
    }
    if (!field || field === "startDate") {
      if (!startDate.trim()) errs.startDate = "Start date is required (YYYY-MM).";
      else delete errs.startDate;
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validate(field);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ institution: true, degree: true, fieldOfStudy: true, startDate: true });
    if (!validate()) return;

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
          <span className="font-gothic text-[10px] font-bold uppercase tracking-[0.2em] text-[#87867f] block">
            Academic Background
          </span>
          <h2 id="academic-modal-title" className="font-gothic text-xl font-bold uppercase tracking-tight text-[#141413]">
            {initialData ? "Edit Academic Record" : "Add Academic Record"}
          </h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Institution */}
        <div>
          <label className="block font-gothic text-xs font-bold uppercase tracking-[0.12em] text-[#141413] mb-1.5">
            Institution / University <span className="text-[#d97757]">*</span>
          </label>
          <input
            type="text"
            value={institution}
            onChange={(e) => {
              setInstitution(e.target.value);
              if (errors.institution) validate("institution");
            }}
            onBlur={() => handleBlur("institution")}
            placeholder="e.g. Royal Danish Academy of Fine Arts (KADK)"
            className={`w-full px-3.5 py-2.5 rounded-xl bg-[#f0eee6] border text-sm text-[#141413] focus:outline-none focus:ring-1 focus:ring-[#141413] ${
              touched.institution && errors.institution ? "border-red-500 bg-red-50/20" : "border-[#cccbc8]/60"
            }`}
          />
          {touched.institution && errors.institution && (
            <p className="font-serif text-xs text-red-600 mt-1">{errors.institution}</p>
          )}
        </div>

        {/* Degree & Field of Study */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-gothic text-xs font-bold uppercase tracking-[0.12em] text-[#141413] mb-1.5">
              Degree <span className="text-[#d97757]">*</span>
            </label>
            <input
              type="text"
              value={degree}
              onChange={(e) => {
                setDegree(e.target.value);
                if (errors.degree) validate("degree");
              }}
              onBlur={() => handleBlur("degree")}
              placeholder="e.g. Master of Architecture"
              className={`w-full px-3.5 py-2.5 rounded-xl bg-[#f0eee6] border text-sm text-[#141413] focus:outline-none focus:ring-1 focus:ring-[#141413] ${
                touched.degree && errors.degree ? "border-red-500 bg-red-50/20" : "border-[#cccbc8]/60"
              }`}
            />
            {touched.degree && errors.degree && (
              <p className="font-serif text-xs text-red-600 mt-1">{errors.degree}</p>
            )}
          </div>

          <div>
            <label className="block font-gothic text-xs font-bold uppercase tracking-[0.12em] text-[#141413] mb-1.5">
              Field of Study <span className="text-[#d97757]">*</span>
            </label>
            <input
              type="text"
              value={fieldOfStudy}
              onChange={(e) => {
                setFieldOfStudy(e.target.value);
                if (errors.fieldOfStudy) validate("fieldOfStudy");
              }}
              onBlur={() => handleBlur("fieldOfStudy")}
              placeholder="e.g. Spatial Design &amp; Daylight"
              className={`w-full px-3.5 py-2.5 rounded-xl bg-[#f0eee6] border text-sm text-[#141413] focus:outline-none focus:ring-1 focus:ring-[#141413] ${
                touched.fieldOfStudy && errors.fieldOfStudy ? "border-red-500 bg-red-50/20" : "border-[#cccbc8]/60"
              }`}
            />
            {touched.fieldOfStudy && errors.fieldOfStudy && (
              <p className="font-serif text-xs text-red-600 mt-1">{errors.fieldOfStudy}</p>
            )}
          </div>
        </div>

        {/* Location & Honors/GPA */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-gothic text-xs font-bold uppercase tracking-[0.12em] text-[#141413] mb-1.5">
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Copenhagen, Denmark"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#f0eee6] border border-[#cccbc8]/60 text-sm text-[#141413] focus:outline-none focus:ring-1 focus:ring-[#141413]"
            />
          </div>

          <div>
            <label className="block font-gothic text-xs font-bold uppercase tracking-[0.12em] text-[#141413] mb-1.5">
              Honors / Distinction / GPA
            </label>
            <input
              type="text"
              value={gpa}
              onChange={(e) => setGpa(e.target.value)}
              placeholder="e.g. First Class Distinction"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#f0eee6] border border-[#cccbc8]/60 text-sm text-[#141413] focus:outline-none focus:ring-1 focus:ring-[#141413]"
            />
          </div>
        </div>

        {/* Dates & Currently Studying */}
        <div className="p-4 rounded-2xl bg-[#f0eee6]/60 border border-[#cccbc8]/40 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-gothic text-xs font-bold uppercase tracking-[0.12em] text-[#141413] mb-1.5">
                Start Date <span className="text-[#d97757]">*</span>
              </label>
              <input
                type="month"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  if (errors.startDate) validate("startDate");
                }}
                onBlur={() => handleBlur("startDate")}
                className={`w-full px-3 py-2 rounded-xl bg-[#faf9f5] border text-sm text-[#141413] focus:outline-none focus:ring-1 focus:ring-[#141413] ${
                  touched.startDate && errors.startDate ? "border-red-500 bg-red-50/20" : "border-[#cccbc8]/60"
                }`}
              />
              {touched.startDate && errors.startDate && (
                <p className="font-serif text-xs text-red-600 mt-1">{errors.startDate}</p>
              )}
            </div>

            <div>
              <label className="block font-gothic text-xs font-bold uppercase tracking-[0.12em] text-[#141413] mb-1.5">
                End Date
              </label>
              <input
                type="month"
                value={endDate}
                disabled={currentlyStudying}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#faf9f5] border border-[#cccbc8]/60 text-sm text-[#141413] focus:outline-none focus:ring-1 focus:ring-[#141413] disabled:opacity-40 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          <label className="flex items-center gap-2.5 pt-1 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={currentlyStudying}
              onChange={(e) => setCurrentlyStudying(e.target.checked)}
              className="w-4 h-4 rounded text-[#d97757] focus:ring-0 focus:ring-offset-0"
            />
            <span className="font-gothic text-xs font-bold uppercase tracking-wider text-[#141413]">
              I am currently enrolled / studying here
            </span>
          </label>
        </div>

        {/* Thesis / Description */}
        <div>
          <label className="block font-gothic text-xs font-bold uppercase tracking-[0.12em] text-[#141413] mb-1.5">
            Thesis / Academic Focus
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Outline your thesis topic, structural focus, or academic research..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#f0eee6] border border-[#cccbc8]/60 text-sm text-[#141413] focus:outline-none focus:ring-1 focus:ring-[#141413] resize-none"
          />
        </div>

        {/* Academic Achievements */}
        <div>
          <label className="block font-gothic text-xs font-bold uppercase tracking-[0.12em] text-[#141413] mb-1.5">
            Honors, Grants &amp; Fellowships
          </label>
          <input
            type="text"
            value={achievements}
            onChange={(e) => setAchievements(e.target.value)}
            placeholder="e.g. Dean's List, Research Fellow, Travel Grant"
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#f0eee6] border border-[#cccbc8]/60 text-sm text-[#141413] focus:outline-none focus:ring-1 focus:ring-[#141413]"
          />
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#cccbc8]/40">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onClose}
            disabled={isSaving}
            className="shadow-none uppercase tracking-wider text-xs font-bold"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="clay"
            size="md"
            disabled={isSaving}
            className="shadow-none uppercase tracking-wider text-xs font-bold"
          >
            {isSaving ? "Saving..." : initialData ? "Update Record" : "Save Record"}
          </Button>
        </div>
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
        key={initialData?.id || "new-academic"}
        onClose={onClose}
        onSave={onSave}
        initialData={initialData}
        isSaving={isSaving}
      />
    </div>
  );
};
