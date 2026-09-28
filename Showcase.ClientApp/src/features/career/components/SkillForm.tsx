import React, { useState } from "react";
import { Button } from "@shared/components/Button.tsx";
import type { CareerSkill } from "@shared/types/index.ts";
import { SKILL_CATEGORIES } from "../constants.ts";

export interface SkillFormProps {
  initialItem: CareerSkill | null;
  isEditing: boolean;
  isSaving: boolean;
  onSave: (payload: Partial<CareerSkill>, validate?: () => boolean) => Promise<void>;
  onCancel: () => void;
}

export const SkillForm: React.FC<SkillFormProps> = ({
  initialItem,
  isEditing,
  isSaving,
  onSave,
  onCancel,
}) => {
  const [name, setName] = useState(initialItem?.name || "");
  const [category, setCategory] = useState(initialItem?.category || SKILL_CATEGORIES[0] || "Design");

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) {
      errs.name = "Skill name is required.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleBlur = () => {
    setTouched((prev) => ({ ...prev, name: true }));
    validate();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true });

    const payload: Partial<CareerSkill> = {
      name: name.trim(),
      category: category.trim() || undefined,
    };

    void onSave(payload, validate);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Skill Name */}
      <div>
        <label className="block font-gothic text-xs font-bold uppercase tracking-[0.12em] text-slate-dark mb-1.5">
          Skill Name <span className="text-red-500 font-bold">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (errors.name) validate();
          }}
          onBlur={handleBlur}
          placeholder="e.g. React, TypeScript, Figma, or Product Strategy"
          className={`w-full px-3.5 py-2.5 rounded-xl bg-ivory-medium border text-sm text-slate-dark focus:outline-none focus:ring-1 focus:ring-slate-dark ${
            touched.name && errors.name ? "border-red-500 bg-red-50/20" : "border-stone/60"
          }`}
        />
        {touched.name && errors.name && (
          <p className="font-serif text-xs text-red-600 mt-1">{errors.name}</p>
        )}
      </div>

      {/* Category Selector */}
      <div>
        <label className="block font-gothic text-xs font-bold uppercase tracking-[0.12em] text-slate-dark mb-2">
          Category
        </label>
        <div className="flex flex-wrap gap-2">
          {SKILL_CATEGORIES.map((cat) => {
            const isSelected = category === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-3.5 py-2 rounded-xl font-gothic text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border ${
                  isSelected
                    ? "bg-slate-dark text-ivory-light border-slate-dark"
                    : "bg-ivory-medium text-cloud-dark border-stone/60 hover:text-slate-dark hover:border-slate-dark"
                }`}
              >
                {cat}
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
          {isSaving ? "Saving..." : isEditing ? "Update Skill" : "Save Skill"}
        </Button>
      </div>
    </form>
  );
};
