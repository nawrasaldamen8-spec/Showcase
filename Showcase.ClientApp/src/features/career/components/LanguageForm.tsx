import React, { useMemo, useState } from "react";
import { Check, Globe, Search, X } from "lucide-react";
import { useLookupLanguagesQuery } from "@shared/hooks/index.ts";
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
  const { data: lookupLanguages = [] } = useLookupLanguagesQuery();
  const [language, setLanguage] = useState(initialItem?.language || "English");
  const [proficiency, setProficiency] = useState<LanguageProficiency>(
    (initialItem?.proficiency as LanguageProficiency) || "Fluent"
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const languageOptions = useMemo(() => {
    if (lookupLanguages && lookupLanguages.length > 0) {
      return lookupLanguages.map((l) => l.name);
    }
    return PREDEFINED_LANGUAGES;
  }, [lookupLanguages]);

  const filteredLanguages = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return languageOptions;
    return languageOptions.filter((l) => l.toLowerCase().includes(q));
  }, [languageOptions, searchQuery]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!language.trim()) {
      errs.language = "Language selection is required.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Language Selection Card */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 font-gothic text-xs font-bold uppercase tracking-[0.12em] text-slate-dark">
          <Globe className="w-4 h-4 text-clay" />
          <span>Language <span className="text-red-500 font-bold">*</span></span>
        </label>

        {/* Selected Language Display Banner */}
        <div className="p-3.5 rounded-xl bg-ivory-medium/60 border border-stone/70 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="font-gothic text-xs font-semibold uppercase tracking-wider text-cloud-dark shrink-0">
              Selected:
            </span>
            <span className="font-serif text-sm font-bold text-slate-dark truncate">
              {language}
            </span>
          </div>
          <span className="font-gothic text-[11px] font-bold uppercase tracking-wider text-clay bg-clay/10 px-2.5 py-0.5 rounded-full shrink-0">
            {proficiency}
          </span>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cloud-dark pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search language (e.g. English, Arabic, French, Japanese, German)..."
            className="w-full pl-10 pr-9 py-2.5 bg-ivory-medium/80 border border-stone/80 rounded-xl font-serif text-xs sm:text-sm text-slate-dark placeholder-cloud-dark focus:outline-none focus:border-slate-dark focus:bg-ivory-light transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-cloud-dark hover:text-slate-dark p-1"
              aria-label="Clear language search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Bounded Scrollable Language Grid (No Numbered Pagination) */}
        <div className="border border-stone/60 rounded-xl p-2.5 bg-ivory-medium/20 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-gothic font-bold uppercase tracking-wider text-cloud-dark px-1">
            <span>All Languages ({filteredLanguages.length})</span>
            <span className="font-serif text-xs lowercase">scroll to browse</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1.5 max-h-60 overflow-y-auto pr-1">
            {filteredLanguages.map((lang) => {
              const isSelected = language === lang;
              return (
                <button
                  key={lang}
                  type="button"
                  onClick={() => {
                    setLanguage(lang);
                    if (errors.language) {
                      setErrors((prev) => ({ ...prev, language: "" }));
                    }
                  }}
                  className={`text-left px-3 py-2 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-1.5 ${
                    isSelected
                      ? "bg-slate-dark text-ivory-light border-slate-dark font-medium"
                      : "bg-ivory-light hover:bg-ivory-medium border-stone/50 text-slate-dark hover:border-slate-dark"
                  }`}
                >
                  <span className="font-serif text-xs truncate">{lang}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-clay shrink-0" />}
                </button>
              );
            })}
          </div>

          {filteredLanguages.length === 0 && (
            <div className="py-6 text-center text-cloud-dark font-serif text-xs">
              No languages match &ldquo;{searchQuery}&rdquo;.
            </div>
          )}
        </div>

        {touched.language && errors.language && (
          <p className="font-serif text-xs text-red-600 mt-1">{errors.language}</p>
        )}
      </div>

      {/* Proficiency Level Grid */}
      <div className="space-y-2">
        <label className="block font-gothic text-xs font-bold uppercase tracking-[0.12em] text-slate-dark">
          Proficiency Level <span className="text-red-500 font-bold">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {PROFICIENCY_LEVELS.map((level) => {
            const isSelected = proficiency === level;
            return (
              <button
                key={level}
                type="button"
                onClick={() => setProficiency(level as LanguageProficiency)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
                  isSelected
                    ? "bg-slate-dark text-ivory-light border-slate-dark"
                    : "bg-ivory-medium/50 text-slate-dark border-stone/60 hover:border-slate-dark hover:bg-ivory-medium"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="font-gothic text-xs font-bold uppercase tracking-wider">{level}</p>
                  <p className={`font-serif text-[11px] truncate mt-0.5 ${isSelected ? "text-ivory-light/75" : "text-cloud-dark"}`}>
                    {level === "Native" && "First language or bilingual proficiency"}
                    {level === "Bilingual" && "Complete bilingual proficiency"}
                    {level === "Fluent" && "Fluent in speaking, reading, and writing"}
                    {level === "Full Professional" && "Full professional working proficiency"}
                    {level === "Professional Working" && "Professional working proficiency"}
                    {level === "Advanced" && "Advanced conversational proficiency"}
                    {level === "Intermediate" && "Good conversational proficiency"}
                    {level === "Limited Working" && "Limited working proficiency"}
                    {level === "Elementary" && "Elementary proficiency"}
                    {level === "Beginner" && "Basic introductory knowledge"}
                  </p>
                </div>
                {isSelected && <Check className="w-4 h-4 text-clay shrink-0" />}
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
