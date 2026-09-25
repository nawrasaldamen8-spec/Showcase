import { ArrowRight } from "lucide-react";
import React from "react";
import { Button } from "@shared/components/Button.tsx";

export interface AcademicStep1Props {
  institution: string;
  setInstitution: (v: string) => void;
  degree: string;
  setDegree: (v: string) => void;
  fieldOfStudy: string;
  setFieldOfStudy: (v: string) => void;
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

export const AcademicStep1: React.FC<AcademicStep1Props> = ({
  institution,
  setInstitution,
  degree,
  setDegree,
  fieldOfStudy,
  setFieldOfStudy,
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
          Institution / University
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block font-gothic text-xs font-bold uppercase tracking-[0.12em] text-[#141413] mb-1.5">
            Degree
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
            Field of Study
          </label>
          <input
            type="text"
            value={fieldOfStudy}
            onChange={(e) => {
              setFieldOfStudy(e.target.value);
              if (errors.fieldOfStudy) validate("fieldOfStudy");
            }}
            onBlur={() => handleBlur("fieldOfStudy")}
            placeholder="e.g. Spatial Design & Daylight"
            className={`w-full px-3.5 py-2.5 rounded-xl bg-[#f0eee6] border text-sm text-[#141413] focus:outline-none focus:ring-1 focus:ring-[#141413] ${
              touched.fieldOfStudy && errors.fieldOfStudy ? "border-red-500 bg-red-50/20" : "border-[#cccbc8]/60"
            }`}
          />
          {touched.fieldOfStudy && errors.fieldOfStudy && (
            <p className="font-serif text-xs text-red-600 mt-1">{errors.fieldOfStudy}</p>
          )}
        </div>
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
