import { ArrowRight } from "lucide-react";
import React from "react";
import { Button } from "@shared/components/Button.tsx";

const ACHIEVEMENT_TYPES = ["Award", "Publication", "Exhibition", "Fellowship", "Grant", "Honor"];

export interface AchievementStep1Props {
  title: string;
  setTitle: (v: string) => void;
  type: string;
  setType: (v: string) => void;
  touched: Record<string, boolean>;
  errors: Record<string, string>;
  validate: () => boolean;
  handleBlur: () => void;
  onCancel: () => void;
  onContinue: (e: React.MouseEvent) => void;
  isSaving: boolean;
}

export const AchievementStep1: React.FC<AchievementStep1Props> = ({
  title,
  setTitle,
  type,
  setType,
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
          Distinction Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (errors.title) validate();
          }}
          onBlur={handleBlur}
          placeholder="e.g. Golden Shutter Award for Documentary Architecture"
          className={`w-full px-3.5 py-2.5 rounded-xl bg-[#f0eee6] border text-sm text-[#141413] focus:outline-none focus:ring-1 focus:ring-[#141413] ${
            touched.title && errors.title ? "border-red-500 bg-red-50/20" : "border-[#cccbc8]/60"
          }`}
        />
        {touched.title && errors.title && (
          <p className="font-serif text-xs text-red-600 mt-1">{errors.title}</p>
        )}
      </div>

      <div>
        <label className="block font-gothic text-xs font-bold uppercase tracking-[0.12em] text-[#141413] mb-1.5">
          Category
        </label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl bg-[#f0eee6] border border-[#cccbc8]/60 text-sm text-[#141413] focus:outline-none focus:ring-1 focus:ring-[#141413]"
        >
          {ACHIEVEMENT_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
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
