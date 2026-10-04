import React, { useState } from "react";
import { Briefcase, Calendar, FileText } from "lucide-react";
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
      if (!jobTitle.trim()) errs.jobTitle = "Role or title is required.";
      else delete errs.jobTitle;
    }
    if (!field || field === "company") {
      if (!company.trim()) errs.company = "Studio or practice name is required.";
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
    <form onSubmit={handleSubmit} className="space-y-8" noValidate>
      {/* Phase 1: Role & Organization */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b border-stone/50 pb-2.5">
          <Briefcase className="w-4 h-4 text-clay" />
          <h3 className="font-gothic text-xs font-bold uppercase tracking-wider text-slate-dark">
            Phase 1 &bull; Organization &amp; Role Identity
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-gothic text-xs font-bold uppercase tracking-[0.10em] text-slate-dark mb-1.5">
              Role Title <span className="text-clay font-bold">*</span>
            </label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => {
                setJobTitle(e.target.value);
                if (errors.jobTitle) validate("jobTitle");
              }}
              onBlur={() => handleBlur("jobTitle")}
              placeholder="e.g. Lead Architect, Urban Researcher"
              className={`w-full px-4 py-2.5 rounded-xl bg-ivory-light border text-sm text-slate-dark focus:outline-none focus:ring-1 focus:ring-slate-dark min-h-[46px] ${
                touched.jobTitle && errors.jobTitle ? "border-clay bg-clay/5" : "border-stone/70"
              }`}
            />
            {touched.jobTitle && errors.jobTitle && (
              <p className="font-serif text-xs text-clay mt-1">{errors.jobTitle}</p>
            )}
          </div>

          <div>
            <label className="block font-gothic text-xs font-bold uppercase tracking-[0.10em] text-slate-dark mb-1.5">
              Practice or Studio <span className="text-clay font-bold">*</span>
            </label>
            <input
              type="text"
              value={company}
              onChange={(e) => {
                setCompany(e.target.value);
                if (errors.company) validate("company");
              }}
              onBlur={() => handleBlur("company")}
              placeholder="e.g. Studio Vance, Foster + Partners"
              className={`w-full px-4 py-2.5 rounded-xl bg-ivory-light border text-sm text-slate-dark focus:outline-none focus:ring-1 focus:ring-slate-dark min-h-[46px] ${
                touched.company && errors.company ? "border-clay bg-clay/5" : "border-stone/70"
              }`}
            />
            {touched.company && errors.company && (
              <p className="font-serif text-xs text-clay mt-1">{errors.company}</p>
            )}
          </div>
        </div>
      </section>

      {/* Phase 2: Duration & Timeline */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b border-stone/50 pb-2.5">
          <Calendar className="w-4 h-4 text-clay" />
          <h3 className="font-gothic text-xs font-bold uppercase tracking-wider text-slate-dark">
            Phase 2 &bull; Timeframe &amp; Status
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-gothic text-xs font-bold uppercase tracking-[0.10em] text-slate-dark mb-1.5">
              Start Date <span className="text-clay font-bold">*</span>
            </label>
            <input
              type="month"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                if (errors.startDate) validate("startDate");
              }}
              onBlur={() => handleBlur("startDate")}
              className={`w-full px-4 py-2.5 rounded-xl bg-ivory-light border text-sm text-slate-dark focus:outline-none focus:ring-1 focus:ring-slate-dark min-h-[46px] ${
                touched.startDate && errors.startDate ? "border-clay bg-clay/5" : "border-stone/70"
              }`}
            />
            {touched.startDate && errors.startDate && (
              <p className="font-serif text-xs text-clay mt-1">{errors.startDate}</p>
            )}
          </div>

          <div>
            <label className="block font-gothic text-xs font-bold uppercase tracking-[0.10em] text-slate-dark mb-1.5">
              End Date
            </label>
            <input
              type="month"
              value={endDate}
              disabled={currentlyWorking}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-ivory-light border border-stone/70 text-sm text-slate-dark focus:outline-none focus:ring-1 focus:ring-slate-dark disabled:opacity-40 disabled:cursor-not-allowed min-h-[46px]"
            />
          </div>
        </div>

        {/* Currently Working Toggle */}
        <div className="pt-1">
          <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={currentlyWorking}
              onChange={(e) => setCurrentlyWorking(e.target.checked)}
              className="w-4 h-4 rounded text-clay focus:ring-0 focus:ring-offset-0 cursor-pointer accent-clay"
            />
            <span className="font-gothic text-xs font-semibold uppercase tracking-wider text-slate-dark">
              I currently practice in this role
            </span>
          </label>
        </div>
      </section>

      {/* Phase 3: Curatorial Narrative & Key Contributions */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b border-stone/50 pb-2.5">
          <FileText className="w-4 h-4 text-clay" />
          <h3 className="font-gothic text-xs font-bold uppercase tracking-wider text-slate-dark">
            Phase 3 &bull; Narrative &amp; Key Contributions
          </h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block font-gothic text-xs font-bold uppercase tracking-[0.10em] text-slate-dark mb-1.5">
              Role Narrative &amp; Practice Focus <span className="font-serif text-[11px] font-normal text-cloud-dark">(Optional)</span>
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detail your architectural leadership, spatial responsibilities, design teams managed..."
              className="w-full px-4 py-3 rounded-xl bg-ivory-light border border-stone/70 font-serif text-sm text-slate-dark focus:outline-none focus:ring-1 focus:ring-slate-dark resize-none leading-relaxed shadow-none"
            />
          </div>

          <div>
            <label className="block font-gothic text-xs font-bold uppercase tracking-[0.10em] text-slate-dark mb-1.5">
              Key Achievements &amp; Built Milestones <span className="font-serif text-[11px] font-normal text-cloud-dark">(Optional)</span>
            </label>
            <input
              type="text"
              value={achievements}
              onChange={(e) => setAchievements(e.target.value)}
              placeholder="e.g. Delivered 45,000 sqm cultural pavilion; AIA Honor Award recipient"
              className="w-full px-4 py-2.5 rounded-xl bg-ivory-light border border-stone/70 text-sm text-slate-dark focus:outline-none focus:ring-1 focus:ring-slate-dark min-h-[46px]"
            />
          </div>
        </div>
      </section>

      {/* Form Action Buttons (Mobile-first full width, Desktop side-by-side) */}
      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-6 border-t border-stone/50">
        <Button
          type="button"
          variant="outline"
          size="md"
          onClick={onCancel}
          disabled={isSaving}
          className="shadow-none uppercase tracking-wider text-xs font-bold w-full sm:w-auto min-h-[46px]"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="clay"
          size="md"
          disabled={isSaving}
          isLoading={isSaving}
          className="shadow-none uppercase tracking-wider text-xs font-bold w-full sm:w-auto min-h-[46px]"
        >
          {isEditing ? "Update Experience" : "Save Milestone"}
        </Button>
      </div>
    </form>
  );
};
