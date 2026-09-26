import { Globe } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiClient } from "@shared/api/apiClient.ts";
import { Button } from "@shared/components/Button.tsx";
import { useToast } from "@shared/context/index.ts";
import type { LanguageProficiency } from "@shared/types/index.ts";
import { CareerActionLayout } from "../components/CareerActionLayout.tsx";

const PREDEFINED_LANGUAGES = ["Arabic", "English"];

const PROFICIENCY_LEVELS: LanguageProficiency[] = [
  "Native",
  "Fluent",
  "Professional",
  "Intermediate",
  "Basic",
];

export const LanguageFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [language, setLanguage] = useState(PREDEFINED_LANGUAGES[0]);
  const [proficiency, setProficiency] = useState<LanguageProficiency>("Fluent");

  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!id) return;
    let mounted = true;

    async function loadItem() {
      setIsLoading(true);
      try {
        const items = await apiClient.getLanguages();
        const found = items.find((lang) => lang.id === id);
        if (found && mounted) {
          setLanguage(found.language || PREDEFINED_LANGUAGES[0]);
          setProficiency((found.proficiency as LanguageProficiency) || "Fluent");
        } else if (!found && mounted) {
          showToast("error", "Language record not found.");
          navigate("/career/languages");
        }
      } catch (err) {
        console.error("Failed to load language record", err);
        if (mounted) {
          showToast("error", "Failed to load language data.");
          navigate("/career/languages");
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    void loadItem();
    return () => {
      mounted = false;
    };
  }, [id, navigate, showToast]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ language: true });
    if (!validate()) return;

    setIsSaving(true);
    try {
      const payload = {
        language: language.trim(),
        proficiency,
      };

      if (isEditing && id) {
        await apiClient.updateLanguage(id, payload);
        showToast("success", "Language updated successfully.");
      } else {
        await apiClient.createLanguage(payload);
        showToast("success", "Language added successfully.");
      }
      navigate("/career/languages");
    } catch (err) {
      console.error("Failed to save language", err);
      showToast("error", "Failed to save language.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <CareerActionLayout
        title={isEditing ? "Edit Language" : "Add Language"}
        subtitle="Add language and proficiency level."
        backTo="/career/languages"
        backLabel="Back to Languages"
        icon={Globe}
      >
        <div className="py-12 text-center text-[#87867f] font-serif">
          Loading language details...
        </div>
      </CareerActionLayout>
    );
  }

  return (
    <CareerActionLayout
      title={isEditing ? "Edit Language" : "Add Language"}
      subtitle="Add language and proficiency level."
      backTo="/career/languages"
      backLabel="Back to Languages"
      icon={Globe}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Language Selection Dropdown */}
        <div>
          <label className="block font-gothic text-xs font-bold uppercase tracking-[0.12em] text-[#141413] mb-1.5">
            Language <span className="text-red-500 font-bold">*</span>
          </label>
          <select
            value={language}
            onChange={(e) => {
              setLanguage(e.target.value);
              if (errors.language) validate();
            }}
            onBlur={handleBlur}
            className={`w-full px-3.5 py-2.5 rounded-xl bg-[#f0eee6] border text-sm text-[#141413] focus:outline-none focus:ring-1 focus:ring-[#141413] cursor-pointer ${
              touched.language && errors.language ? "border-red-500 bg-red-50/20" : "border-[#cccbc8]/60"
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
          <label className="block font-gothic text-xs font-bold uppercase tracking-[0.12em] text-[#141413] mb-2">
            Proficiency Level <span className="text-red-500 font-bold">*</span>
          </label>
          <div className="grid grid-cols-1 gap-2.5">
            {PROFICIENCY_LEVELS.map((level) => {
              const isSelected = proficiency === level;
              return (
                <button
                  key={level}
                  type="button"
                  onClick={() => setProficiency(level)}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2 p-3 sm:p-3.5 rounded-xl border text-left transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-[#141413] text-[#faf9f5] border-[#141413]"
                      : "bg-[#f0eee6] text-[#141413] border-[#cccbc8]/60 hover:border-[#141413]"
                  }`}
                >
                  <span className="font-gothic text-xs font-bold uppercase tracking-wider">{level}</span>
                  <span className="font-serif text-xs opacity-75">
                    {level === "Native" && "First language or bilingual proficiency"}
                    {level === "Fluent" && "Fluent in speaking and writing"}
                    {level === "Professional" && "Professional working proficiency"}
                    {level === "Intermediate" && "Good conversational proficiency"}
                    {level === "Basic" && "Basic conversational knowledge"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 pt-5 border-t border-[#cccbc8]/40">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={() => navigate("/career/languages")}
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
    </CareerActionLayout>
  );
};
