import { Briefcase, X } from "lucide-react";
import React, { useState } from "react";
import { Button } from "../../../shared/components/Button.tsx";
import type { CareerExperience } from "../../../shared/types/index.ts";

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
  const [company, setCompany] = useState(initialData?.company || "");
  const [jobTitle, setJobTitle] = useState(initialData?.jobTitle || "");
  const [startDate, setStartDate] = useState(initialData?.startDate || "");
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
      if (!company.trim()) errs.company = "Company or Studio name is required.";
      else delete errs.company;
    }
    if (!field || field === "jobTitle") {
      if (!jobTitle.trim()) errs.jobTitle = "Role or Job Title is required.";
      else delete errs.jobTitle;
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
    setTouched({ company: true, jobTitle: true, startDate: true });
    if (!validate()) return;

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
          <span className="font-gothic text-[10px] font-bold uppercase tracking-[0.2em] text-[#87867f] block">
            Career Trajectory
          </span>
          <h2 id="experience-modal-title" className="font-gothic text-xl font-bold uppercase tracking-tight text-[#141413]">
            {initialData ? "Edit Position" : "Record Position"}
          </h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Company */}
        <div>
          <label className="block font-gothic text-xs font-bold uppercase tracking-[0.12em] text-[#141413] mb-1.5">
            Company / Studio <span className="text-[#d97757]">*</span>
          </label>
          <input
            type="text"
            value={company}
            onChange={(e) => {
              setCompany(e.target.value);
              if (errors.company) validate("company");
            }}
            onBlur={() => handleBlur("company")}
            placeholder="e.g. Studio Vance Spatial Research"
            className={`w-full px-3.5 py-2.5 rounded-xl bg-[#f0eee6] border text-sm text-[#141413] focus:outline-none focus:ring-1 focus:ring-[#141413] ${
              touched.company && errors.company ? "border-red-500 bg-red-50/20" : "border-[#cccbc8]/60"
            }`}
          />
          {touched.company && errors.company && (
            <p className="font-serif text-xs text-red-600 mt-1">{errors.company}</p>
          )}
        </div>

        {/* Job Title */}
        <div>
          <label className="block font-gothic text-xs font-bold uppercase tracking-[0.12em] text-[#141413] mb-1.5">
            Job Title / Role <span className="text-[#d97757]">*</span>
          </label>
          <input
            type="text"
            value={jobTitle}
            onChange={(e) => {
              setJobTitle(e.target.value);
              if (errors.jobTitle) validate("jobTitle");
            }}
            onBlur={() => handleBlur("jobTitle")}
            placeholder="e.g. Principal Architectural Documentarian"
            className={`w-full px-3.5 py-2.5 rounded-xl bg-[#f0eee6] border text-sm text-[#141413] focus:outline-none focus:ring-1 focus:ring-[#141413] ${
              touched.jobTitle && errors.jobTitle ? "border-red-500 bg-red-50/20" : "border-[#cccbc8]/60"
            }`}
          />
          {touched.jobTitle && errors.jobTitle && (
            <p className="font-serif text-xs text-red-600 mt-1">{errors.jobTitle}</p>
          )}
        </div>

        {/* Employment Type & Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-gothic text-xs font-bold uppercase tracking-[0.12em] text-[#141413] mb-1.5">
              Employment Type
            </label>
            <select
              value={employmentType}
              onChange={(e) => setEmploymentType(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-[#f0eee6] border border-[#cccbc8]/60 text-sm text-[#141413] focus:outline-none focus:ring-1 focus:ring-[#141413]"
            >
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Freelance">Freelance</option>
              <option value="Internship">Internship</option>
              <option value="Advisory">Advisory</option>
            </select>
          </div>

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
        </div>

        {/* Start Date & End Date / Currently Working */}
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
                disabled={currentlyWorking}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#faf9f5] border border-[#cccbc8]/60 text-sm text-[#141413] focus:outline-none focus:ring-1 focus:ring-[#141413] disabled:opacity-40 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          <label className="flex items-center gap-2.5 pt-1 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={currentlyWorking}
              onChange={(e) => setCurrentlyWorking(e.target.checked)}
              className="w-4 h-4 rounded text-[#d97757] focus:ring-0 focus:ring-offset-0"
            />
            <span className="font-gothic text-xs font-bold uppercase tracking-wider text-[#141413]">
              I currently work in this role
            </span>
          </label>
        </div>

        {/* Description */}
        <div>
          <label className="block font-gothic text-xs font-bold uppercase tracking-[0.12em] text-[#141413] mb-1.5">
            Description &amp; Curatorial Focus
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Outline your spatial, design, or directorial responsibilities..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#f0eee6] border border-[#cccbc8]/60 text-sm text-[#141413] focus:outline-none focus:ring-1 focus:ring-[#141413] resize-none"
          />
        </div>

        {/* Achievements */}
        <div>
          <label className="block font-gothic text-xs font-bold uppercase tracking-[0.12em] text-[#141413] mb-1.5">
            Key Achievements &amp; Milestones
          </label>
          <input
            type="text"
            value={achievements}
            onChange={(e) => setAchievements(e.target.value)}
            placeholder="e.g. Curated 14 exhibitions; co-authored daylight monograph"
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#f0eee6] border border-[#cccbc8]/60 text-sm text-[#141413] focus:outline-none focus:ring-1 focus:ring-[#141413]"
          />
        </div>

        {/* Skills Used */}
        <div>
          <label className="block font-gothic text-xs font-bold uppercase tracking-[0.12em] text-[#141413] mb-1.5">
            Skills Used <span className="font-serif normal-case text-xs text-[#87867f]">(comma separated)</span>
          </label>
          <input
            type="text"
            value={skillsText}
            onChange={(e) => setSkillsText(e.target.value)}
            placeholder="e.g. Architectural Curation, Daylight Scenography, Medium Format"
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
            {isSaving ? "Saving..." : initialData ? "Update Position" : "Save Position"}
          </Button>
        </div>
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
