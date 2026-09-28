import React, { useState } from "react";
import { Button } from "@shared/components/Button.tsx";
import type { CareerExperience } from "@shared/types/index.ts";

export interface ExperienceFormProps {
  initialItem: CareerExperience | null;
  isEditing: boolean;
  isSaving: boolean;
  onSave: (payload: Partial<CareerExperience>, validate?: () => boolean) => Promise<void>;
  onCancel: () => void;
}

export const ExperienceForm: React.FC<ExperienceFormProps> = ({
  initialItem,
  isEditing,
  isSaving,
  onSave,
  onCancel,
}) => {
  const [jobTitle, setJobTitle] = useState(initialItem?.jobTitle || "");
  const [company, setCompany] = useState(initialItem?.company || "");
  const [startDate, setStartDate] = useState(initialItem?.startDate || "");
  const [endDate, setEndDate] = useState(initialItem?.endDate || "");
  const [currentlyWorking, setCurrentlyWorking] = useState(Boolean(initialItem?.currentlyWorking));
  const [description, setDescription] = useState(initialItem?.description || "");
  const [achievements, setAchievements] = useState(initialItem?.achievements || "");

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (field?: string) => {
    const errs: Record<string, string> = { ...errors };

    if (!field || field === "jobTitle") {
      if (!jobTitle.trim()) errs.jobTitle = "Job title or role is required.";
      else delete errs.jobTitle;
    }
    if (!field || field === "company") {
      if (!company.trim()) errs.company = "Company or studio name is required.";
      else delete errs.company;
    }
    if (!field || field === "startDate") {
      if (!startDate.trim()) errs.startDate = "Start date is required.";
      else delete errs.startDate;
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validate(field);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ jobTitle: true, company: true, startDate: true });

    const payload: Partial<CareerExperience> = {
      jobTitle: jobTitle.trim(),
      company: company.trim(),
      startDate: startDate.trim(),
      endDate: currentlyWorking ? undefined : endDate.trim() || undefined,
      currentlyWorking,
      description: description.trim() || undefined,
      achievements: achievements.trim() || undefined,
    };

    void onSave(payload, validate);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Job Title */}
      <div>
        <label className="block font-gothic text-xs font-bold uppercase tracking-[0.12em] text-slate-dark mb-1.5">
          Job Title / Role <span className="text-red-500 font-bold">*</span>
        </label>
        <input
          type="text"
          value={jobTitle}
          onChange={(e) => {
            setJobTitle(e.target.value);
            if (errors.jobTitle) validate("jobTitle");
          }}
          onBlur={() => handleBlur("jobTitle")}
          placeholder="e.g. Senior Software Engineer or Product Designer"
          className={`w-full px-3.5 py-2.5 rounded-xl bg-ivory-medium border text-sm text-slate-dark focus:outline-none focus:ring-1 focus:ring-slate-dark ${
            touched.jobTitle && errors.jobTitle ? "border-red-500 bg-red-50/20" : "border-stone/60"
          }`}
        />
        {touched.jobTitle && errors.jobTitle && (
          <p className="font-serif text-xs text-red-600 mt-1">{errors.jobTitle}</p>
        )}
      </div>

      {/* Company / Studio */}
      <div>
        <label className="block font-gothic text-xs font-bold uppercase tracking-[0.12em] text-slate-dark mb-1.5">
          Company / Organization <span className="text-red-500 font-bold">*</span>
        </label>
        <input
          type="text"
          value={company}
          onChange={(e) => {
            setCompany(e.target.value);
            if (errors.company) validate("company");
          }}
          onBlur={() => handleBlur("company")}
          placeholder="e.g. Acme Corp or TechStudio"
          className={`w-full px-3.5 py-2.5 rounded-xl bg-ivory-medium border text-sm text-slate-dark focus:outline-none focus:ring-1 focus:ring-slate-dark ${
            touched.company && errors.company ? "border-red-500 bg-red-50/20" : "border-stone/60"
          }`}
        />
        {touched.company && errors.company && (
          <p className="font-serif text-xs text-red-600 mt-1">{errors.company}</p>
        )}
      </div>

      {/* Start Date & End Date */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block font-gothic text-xs font-bold uppercase tracking-[0.12em] text-slate-dark mb-1.5">
            Start Date <span className="text-red-500 font-bold">*</span>
          </label>
          <input
            type="month"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              if (errors.startDate) validate("startDate");
            }}
            onBlur={() => handleBlur("startDate")}
            className={`w-full px-3.5 py-2.5 rounded-xl bg-ivory-medium border text-sm text-slate-dark focus:outline-none focus:ring-1 focus:ring-slate-dark ${
              touched.startDate && errors.startDate ? "border-red-500 bg-red-50/20" : "border-stone/60"
            }`}
          />
          {touched.startDate && errors.startDate && (
            <p className="font-serif text-xs text-red-600 mt-1">{errors.startDate}</p>
          )}
        </div>

        <div>
          <label className="block font-gothic text-xs font-bold uppercase tracking-[0.12em] text-slate-dark mb-1.5">
            End Date
          </label>
          <input
            type="month"
            value={endDate}
            disabled={currentlyWorking}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-ivory-medium border border-stone/60 text-sm text-slate-dark focus:outline-none focus:ring-1 focus:ring-slate-dark disabled:opacity-40 disabled:cursor-not-allowed"
          />
        </div>
      </div>

      {/* Currently Working Checkbox */}
      <div className="pt-0.5">
        <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={currentlyWorking}
            onChange={(e) => setCurrentlyWorking(e.target.checked)}
            className="w-4 h-4 rounded text-clay focus:ring-0 focus:ring-offset-0 cursor-pointer"
          />
          <span className="font-gothic text-xs font-semibold text-slate-dark">
            I currently work in this role
          </span>
        </label>
      </div>

      {/* Description */}
      <div>
        <label className="block font-gothic text-xs font-bold uppercase tracking-[0.12em] text-slate-dark mb-1.5">
          Description
        </label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your responsibilities, projects, and impact..."
          className="w-full px-3.5 py-2.5 rounded-xl bg-ivory-medium border border-stone/60 text-sm text-slate-dark focus:outline-none focus:ring-1 focus:ring-slate-dark resize-none"
        />
      </div>

      {/* Key Achievements */}
      <div>
        <label className="block font-gothic text-xs font-bold uppercase tracking-[0.12em] text-slate-dark mb-1.5">
          Key Achievements
        </label>
        <input
          type="text"
          value={achievements}
          onChange={(e) => setAchievements(e.target.value)}
          placeholder="e.g. Increased system performance by 40% or Led redesign initiative"
          className="w-full px-3.5 py-2.5 rounded-xl bg-ivory-medium border border-stone/60 text-sm text-slate-dark focus:outline-none focus:ring-1 focus:ring-slate-dark"
        />
      </div>

      {/* Form Actions */}
      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 pt-5 border-t border-stone/40">
        <Button
          type="button"
          variant="outline"
          size="md"
          onClick={onCancel}
          disabled={isSaving}
          className="shadow-none uppercase tracking-wider text-xs font-bold w-full sm:w-auto"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="clay"
          size="md"
          disabled={isSaving}
          className="shadow-none uppercase tracking-wider text-xs font-bold w-full sm:w-auto"
        >
          {isSaving ? "Saving..." : isEditing ? "Update Experience" : "Save Experience"}
        </Button>
      </div>
    </form>
  );
};
