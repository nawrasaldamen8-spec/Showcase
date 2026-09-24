import { Globe, X } from "lucide-react";
import React, { useState } from "react";
import { Button } from "../../../shared/components/Button.tsx";
import type { CareerLanguage, LanguageProficiency } from "../../../shared/types/index.ts";

export interface LanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<CareerLanguage, "id" | "createdAt">) => Promise<void>;
  initialData?: CareerLanguage | null;
  isSaving?: boolean;
}

const PROFICIENCY_LEVELS: LanguageProficiency[] = [
  "Native",
  "Fluent",
  "Professional",
  "Intermediate",
  "Basic",
];

const LanguageModalForm: React.FC<Omit<LanguageModalProps, "isOpen">> = ({
  onClose,
  onSave,
  initialData,
  isSaving = false,
}) => {
  const [language, setLanguage] = useState(initialData?.language || "");
  const [proficiency, setProficiency] = useState<LanguageProficiency>(
    (initialData?.proficiency as LanguageProficiency) || "Fluent"
  );

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!language.trim()) {
      errs.language = "Language name is required.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleBlur = () => {
    setTouched((prev) => ({ ...prev, language: true }));
    validate();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ language: true });
    if (!validate()) return;

    await onSave({
      language: language.trim(),
      proficiency,
    });
  };

  return (
    <div className="relative w-full max-w-md my-8 rounded-[24px] bg-[#faf9f5] border border-[#cccbc8] p-6 sm:p-7 shadow-none text-[#141413]">
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
          <Globe className="w-5 h-5 stroke-[1.75]" />
        </div>
        <div>
          <span className="font-gothic text-[10px] font-bold uppercase tracking-[0.2em] text-[#87867f] block">
            Linguistic Fluency
          </span>
          <h2 id="language-modal-title" className="font-gothic text-xl font-bold uppercase tracking-tight text-[#141413]">
            {initialData ? "Edit Language" : "Add Language"}
          </h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Language */}
        <div>
          <label className="block font-gothic text-xs font-bold uppercase tracking-[0.12em] text-[#141413] mb-1.5">
            Language <span className="text-[#d97757]">*</span>
          </label>
          <input
            type="text"
            value={language}
            onChange={(e) => {
              setLanguage(e.target.value);
              if (errors.language) validate();
            }}
            onBlur={handleBlur}
            placeholder="e.g. Danish, German, French"
            className={`w-full px-3.5 py-2.5 rounded-xl bg-[#f0eee6] border text-sm text-[#141413] focus:outline-none focus:ring-1 focus:ring-[#141413] ${
              touched.language && errors.language ? "border-red-500 bg-red-50/20" : "border-[#cccbc8]/60"
            }`}
          />
          {touched.language && errors.language && (
            <p className="font-serif text-xs text-red-600 mt-1">{errors.language}</p>
          )}
        </div>

        {/* Proficiency */}
        <div>
          <label className="block font-gothic text-xs font-bold uppercase tracking-[0.12em] text-[#141413] mb-2">
            Fluency Level <span className="text-[#d97757]">*</span>
          </label>
          <div className="grid grid-cols-1 gap-2">
            {PROFICIENCY_LEVELS.map((level) => {
              const isSelected = proficiency === level;
              return (
                <button
                  key={level}
                  type="button"
                  onClick={() => setProficiency(level)}
                  className={`flex items-center justify-between p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-[#141413] text-[#faf9f5] border-[#141413]"
                      : "bg-[#f0eee6] text-[#141413] border-[#cccbc8]/60 hover:border-[#141413]"
                  }`}
                >
                  <span className="font-gothic text-xs font-bold uppercase tracking-wider">{level}</span>
                  <span className="font-serif text-[12px] opacity-70">
                    {level === "Native" && "First language or bilingual proficiency"}
                    {level === "Fluent" && "Complete professional & social fluency"}
                    {level === "Professional" && "Comfortable working and communicating"}
                    {level === "Intermediate" && "Good conversational comprehension"}
                    {level === "Basic" && "Fundamental elementary vocabulary"}
                  </span>
                </button>
              );
            })}
          </div>
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
            {isSaving ? "Saving..." : initialData ? "Update Language" : "Add Language"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export const LanguageModal: React.FC<LanguageModalProps> = ({
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
      aria-labelledby="language-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#141413]/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150"
    >
      <LanguageModalForm
        key={initialData?.id || "new-lang"}
        onClose={onClose}
        onSave={onSave}
        initialData={initialData}
        isSaving={isSaving}
      />
    </div>
  );
};
