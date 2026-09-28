import React, { useState } from "react";
import { Button } from "@shared/components/Button.tsx";
import type { CareerLanguage, LanguageProficiency } from "@shared/types/index.ts";
import { PREDEFINED_LANGUAGES, PROFICIENCY_LEVELS } from "../constants.ts";

export interface LanguageFormProps {
  initialItem: CareerLanguage | null;
  isEditing: boolean;
  isSaving: boolean;
  onSave: (payload: Partial<CareerLanguage>, validate?: () => boolean) => Promise<void>;
  onCancel: () => void;
}

export const LanguageForm: React.FC<LanguageFormProps> = ({
  initialItem,
  isEditing,
  isSaving,
  onSave,
  onCancel,
}) => {
  const [language, setLanguage] = useState(initialItem?.language || PREDEFINED_LANGUAGES[0] || "English");
  const [proficiency, setProficiency] = useState<LanguageProficiency>(
    (initialItem?.proficiency as LanguageProficiency) || "Fluent"
  );

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!language.trim()) {
      errs.language = "Language selection is required.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleBlur = () => {
    setTouched((prev) => ({ ...prev, language: true }));
    validate();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ language: true });

    const payload: Partial<CareerLanguage> = {
      language: language.trim(),
      proficiency,
    };

    void onSave(payload, validate);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Language Selection Dropdown */}
      <div>
        <label className="block font-gothic text-xs font-bold uppercase tracking-[0.12em] text-slate-dark mb-1.5">
          Language <span className="text-red-500 font-bold">*</span>
        </label>
        <select
          value={language}
          onChange={(e) => {
            setLanguage(e.target.value);
            if (errors.language) validate();
          }}
          onBlur={handleBlur}
          className={`w-full px-3.5 py-2.5 rounded-xl bg-ivory-medium border text-sm text-slate-dark focus:outline-none focus:ring-1 focus:ring-slate-dark cursor-pointer ${
            touched.language && errors.language ? "border-red-500 bg-red-50/20" : "border-stone/60"
          }`}
        >
          {PREDEFINED_LANGUAGES.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>
        {touched.language && errors.language && (
          <p className="font-serif text-xs text-red-600 mt-1">{errors.language}</p>
        )}
      </div>

      {/* Proficiency */}
      <div>
        <label className="block font-gothic text-xs font-bold uppercase tracking-[0.12em] text-slate-dark mb-2">
          Proficiency Level <span className="text-red-500 font-bold">*</span>
        </label>
        <div className="grid grid-cols-1 gap-2.5">
          {PROFICIENCY_LEVELS.map((level) => {
            const isSelected = proficiency === level;
            return (
              <button
                key={level}
                type="button"
                onClick={() => setProficiency(level as LanguageProficiency)}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2 p-3 sm:p-3.5 rounded-xl border text-left transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-slate-dark text-ivory-light border-slate-dark"
                    : "bg-ivory-medium text-slate-dark border-stone/60 hover:border-slate-dark"
                }`}
              >
                <span className="font-gothic text-xs font-bold uppercase tracking-wider">{level}</span>
                <span className="font-serif text-xs opacity-75">
                  {level === "Native" && "First language or bilingual proficiency"}
                  {level === "Fluent" && "Fluent in speaking and writing"}
                  {level === "Full Professional" && "Full professional working proficiency"}
                  {level === "Professional Working" && "Professional working proficiency"}
                  {level === "Intermediate" && "Good conversational proficiency"}
                  {level === "Beginner" && "Basic conversational knowledge"}
                </span>
              </button>
            );
          })}
        </div>
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
          {isSaving ? "Saving..." : isEditing ? "Update Language" : "Add Language"}
        </Button>
      </div>
    </form>
  );
};
