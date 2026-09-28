import React, { useState } from "react";
import { Button } from "@shared/components/Button.tsx";
import type { CareerAcademic } from "@shared/types/index.ts";
import { ACADEMIC_DEGREE_OPTIONS } from "../constants.ts";

export interface AcademicFormProps {
  initialItem: CareerAcademic | null;
  isEditing: boolean;
  isSaving: boolean;
  onSave: (payload: Partial<CareerAcademic>, validate?: () => boolean) => Promise<void>;
  onCancel: () => void;
}

export const AcademicForm: React.FC<AcademicFormProps> = ({
  initialItem,
  isEditing,
  isSaving,
  onSave,
  onCancel,
}) => {
  const [institution, setInstitution] = useState(initialItem?.institution || "");
  const [degree, setDegree] = useState(initialItem?.degree || ACADEMIC_DEGREE_OPTIONS[0] || "");
  const [fieldOfStudy, setFieldOfStudy] = useState(initialItem?.fieldOfStudy || "");
  const [startDate, setStartDate] = useState(initialItem?.startDate || "");
  const [endDate, setEndDate] = useState(initialItem?.endDate || "");
  const [currentlyStudying, setCurrentlyStudying] = useState(Boolean(initialItem?.currentlyStudying));
  const [gpa, setGpa] = useState(initialItem?.gpa || "");
  const [achievements, setAchievements] = useState(initialItem?.achievements || "");

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (field?: string) => {
    const errs: Record<string, string> = { ...errors };

    if (!field || field === "institution") {
      if (!institution.trim()) errs.institution = "Institution or University is required.";
      else delete errs.institution;
    }
    if (!field || field === "degree") {
      if (!degree.trim()) errs.degree = "Degree or Academic stage is required.";
      else delete errs.degree;
    }
    if (!field || field === "fieldOfStudy") {
      if (!fieldOfStudy.trim()) errs.fieldOfStudy = "Field of study or major is required.";
      else delete errs.fieldOfStudy;
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
    setTouched({ institution: true, degree: true, fieldOfStudy: true, startDate: true });

    const payload: Partial<CareerAcademic> = {
      institution: institution.trim(),
      degree: degree.trim(),
      fieldOfStudy: fieldOfStudy.trim(),
      startDate: startDate.trim(),
      endDate: currentlyStudying ? undefined : endDate.trim() || undefined,
      currentlyStudying,
      gpa: gpa.trim() || undefined,
      achievements: achievements.trim() || undefined,
    };

    void onSave(payload, validate);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Institution */}
      <div>
        <label className="block font-gothic text-xs font-bold uppercase tracking-[0.12em] text-slate-dark mb-1.5">
          Institution / University <span className="text-red-500 font-bold">*</span>
        </label>
        <input
          type="text"
          value={institution}
          onChange={(e) => {
            setInstitution(e.target.value);
            if (errors.institution) validate("institution");
          }}
          onBlur={() => handleBlur("institution")}
          placeholder="e.g. University of California, Berkeley"
          className={`w-full px-3.5 py-2.5 rounded-xl bg-ivory-medium border text-sm text-slate-dark focus:outline-none focus:ring-1 focus:ring-slate-dark ${
            touched.institution && errors.institution ? "border-red-500 bg-red-50/20" : "border-stone/60"
          }`}
        />
        {touched.institution && errors.institution && (
          <p className="font-serif text-xs text-red-600 mt-1">{errors.institution}</p>
        )}
      </div>

      {/* Degree Dropdown & Field of Study */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block font-gothic text-xs font-bold uppercase tracking-[0.12em] text-slate-dark mb-1.5">
            Degree / Stage <span className="text-red-500 font-bold">*</span>
          </label>
          <select
            value={degree}
            onChange={(e) => {
              setDegree(e.target.value);
              if (errors.degree) validate("degree");
            }}
            onBlur={() => handleBlur("degree")}
            className={`w-full px-3.5 py-2.5 rounded-xl bg-ivory-medium border text-sm text-slate-dark focus:outline-none focus:ring-1 focus:ring-slate-dark cursor-pointer ${
              touched.degree && errors.degree ? "border-red-500 bg-red-50/20" : "border-stone/60"
            }`}
          >
            {ACADEMIC_DEGREE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          {touched.degree && errors.degree && (
            <p className="font-serif text-xs text-red-600 mt-1">{errors.degree}</p>
          )}
        </div>

        <div>
          <label className="block font-gothic text-xs font-bold uppercase tracking-[0.12em] text-slate-dark mb-1.5">
            Field of Study / Major <span className="text-red-500 font-bold">*</span>
          </label>
          <input
            type="text"
            value={fieldOfStudy}
            onChange={(e) => {
              setFieldOfStudy(e.target.value);
              if (errors.fieldOfStudy) validate("fieldOfStudy");
            }}
            onBlur={() => handleBlur("fieldOfStudy")}
            placeholder="e.g. Computer Science, Graphic Design, or Business"
            className={`w-full px-3.5 py-2.5 rounded-xl bg-ivory-medium border text-sm text-slate-dark focus:outline-none focus:ring-1 focus:ring-slate-dark ${
              touched.fieldOfStudy && errors.fieldOfStudy ? "border-red-500 bg-red-50/20" : "border-stone/60"
            }`}
          />
          {touched.fieldOfStudy && errors.fieldOfStudy && (
            <p className="font-serif text-xs text-red-600 mt-1">{errors.fieldOfStudy}</p>
          )}
        </div>
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
            disabled={currentlyStudying}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-ivory-medium border border-stone/60 text-sm text-slate-dark focus:outline-none focus:ring-1 focus:ring-slate-dark disabled:opacity-40 disabled:cursor-not-allowed"
          />
        </div>
      </div>

      {/* Currently Studying Checkbox */}
      <div className="pt-0.5">
        <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={currentlyStudying}
            onChange={(e) => setCurrentlyStudying(e.target.checked)}
            className="w-4 h-4 rounded text-clay focus:ring-0 focus:ring-offset-0 cursor-pointer"
          />
          <span className="font-gothic text-xs font-semibold text-slate-dark">
            I am currently studying here
          </span>
        </label>
      </div>

      {/* GPA & Honors */}
      <div>
        <label className="block font-gothic text-xs font-bold uppercase tracking-[0.12em] text-slate-dark mb-1.5">
          GPA / Honors (Optional)
        </label>
        <input
          type="text"
          value={gpa}
          onChange={(e) => setGpa(e.target.value)}
          placeholder="e.g. 3.8 / 4.0 or Magna Cum Laude"
          className="w-full px-3.5 py-2.5 rounded-xl bg-ivory-medium border border-stone/60 text-sm text-slate-dark focus:outline-none focus:ring-1 focus:ring-slate-dark"
        />
      </div>

      {/* Notable Distinctions & Awards */}
      <div>
        <label className="block font-gothic text-xs font-bold uppercase tracking-[0.12em] text-slate-dark mb-1.5">
          Awards &amp; Activities (Optional)
        </label>
        <input
          type="text"
          value={achievements}
          onChange={(e) => setAchievements(e.target.value)}
          placeholder="e.g. Dean's List, Research Assistant, Club President"
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
          {isSaving ? "Saving..." : isEditing ? "Update Education" : "Save Education"}
        </Button>
      </div>
    </form>
  );
};
