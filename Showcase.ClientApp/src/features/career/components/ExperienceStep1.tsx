import { ArrowRight } from "lucide-react";
import React from "react";
import { Button } from "@shared/components/Button.tsx";

export interface ExperienceStep1Props {
  company: string;
  setCompany: (v: string) => void;
  jobTitle: string;
  setJobTitle: (v: string) => void;
  startDate: string;
  setStartDate: (v: string) => void;
  touched: Record<string, boolean>;
  errors: Record<string, string>;
  validate: (field?: string) => boolean;
  handleBlur: (field: string) => void;
  onCancel: () => void;
  onContinue: (e: React.MouseEvent) => void;
  isSaving: boolean;
}

export const ExperienceStep1: React.FC<ExperienceStep1Props> = ({
  company,
  setCompany,
  jobTitle,
  setJobTitle,
  startDate,
  setStartDate,
  touched,
  errors,
  validate,
  handleBlur,
  onCancel,
  onContinue,
  isSaving,
}) => {
  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      <div>
        <label className="block font-gothic text-xs font-bold uppercase tracking-[0.12em] text-[#141413] mb-1.5">
          Company / Studio
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

      <div>
        <label className="block font-gothic text-xs font-bold uppercase tracking-[0.12em] text-[#141413] mb-1.5">
          Job Title / Role
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

      <div>
        <label className="block font-gothic text-xs font-bold uppercase tracking-[0.12em] text-[#141413] mb-1.5">
          Start Date
        </label>
        <input
          type="month"
          value={startDate}
          onChange={(e) => {
            setStartDate(e.target.value);
            if (errors.startDate) validate("startDate");
          }}
          onBlur={() => handleBlur("startDate")}
          className={`w-full px-3.5 py-2.5 rounded-xl bg-[#f0eee6] border text-sm text-[#141413] focus:outline-none focus:ring-1 focus:ring-[#141413] ${
            touched.startDate && errors.startDate ? "border-red-500 bg-red-50/20" : "border-[#cccbc8]/60"
          }`}
        />
        {touched.startDate && errors.startDate && (
          <p className="font-serif text-xs text-red-600 mt-1">{errors.startDate}</p>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-[#cccbc8]/40">
        <Button
          type="button"
          variant="outline"
          size="md"
          onClick={onCancel}
          disabled={isSaving}
          className="shadow-none uppercase tracking-wider text-xs font-bold"
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="clay"
          size="md"
          onClick={onContinue}
          disabled={isSaving}
          className="shadow-none uppercase tracking-wider text-xs font-bold inline-flex items-center gap-1.5"
        >
          Continue
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
};
