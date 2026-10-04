import React, { useState } from "react";
import { Button } from "@shared/components/Button.tsx";
import type { CareerAchievement } from "@shared/types/index.ts";
import { ACHIEVEMENT_TYPES } from "../constants.ts";

export interface AchievementFormProps {
  initialItem: CareerAchievement | null;
  isEditing: boolean;
  isSaving: boolean;
  onSave: (payload: Partial<CareerAchievement>, validate?: () => boolean) => Promise<void>;
  onCancel: () => void;
}

export const AchievementForm: React.FC<AchievementFormProps> = ({
  initialItem,
  isEditing,
  isSaving,
  onSave,
  onCancel,
}) => {
  const [title, setTitle] = useState(initialItem?.title || "");
  const [type, setType] = useState(initialItem?.type || ACHIEVEMENT_TYPES[0] || "");
  const [organization, setOrganization] = useState(initialItem?.organization || "");
  const [date, setDate] = useState(initialItem?.date || "");
  const [url, setUrl] = useState(initialItem?.url || "");
  const [mediaUrl, setMediaUrl] = useState(initialItem?.mediaUrl || "");
  const [description, setDescription] = useState(initialItem?.description || "");

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!title.trim()) {
      errs.title = "Achievement title is required.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleBlur = () => {
    setTouched((prev) => ({ ...prev, title: true }));
    validate();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ title: true });

    const payload: Partial<CareerAchievement> = {
      title: title.trim(),
      type: type?.trim() || undefined,
      organization: organization.trim() || undefined,
      date: date.trim() || undefined,
      url: url.trim() || undefined,
      mediaUrl: mediaUrl.trim() || undefined,
      description: description.trim() || undefined,
    };

    void onSave(payload, validate);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Title */}
      <div>
        <label className="block font-gothic text-xs font-bold uppercase tracking-[0.12em] text-slate-dark mb-1.5">
          Achievement Title <span className="text-red-500 font-bold">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (errors.title) validate();
          }}
          onBlur={handleBlur}
          placeholder="e.g. Best Design Award 2024 or Published Research Paper"
          className={`w-full px-3.5 py-2.5 rounded-xl bg-ivory-medium border text-sm text-slate-dark focus:outline-none focus:ring-1 focus:ring-slate-dark ${
            touched.title && errors.title ? "border-red-500 bg-red-50/20" : "border-stone/60"
          }`}
        />
        {touched.title && errors.title && (
          <p className="font-serif text-xs text-red-600 mt-1">{errors.title}</p>
        )}
      </div>

      {/* Category */}
      <div>
        <label className="block font-gothic text-xs font-bold uppercase tracking-[0.12em] text-slate-dark mb-1.5">
          Category
        </label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-xl bg-ivory-medium border border-stone/60 text-sm text-slate-dark focus:outline-none focus:ring-1 focus:ring-slate-dark cursor-pointer"
        >
          {ACHIEVEMENT_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {/* Organization / Issuer */}
      <div>
        <label className="block font-gothic text-xs font-bold uppercase tracking-[0.12em] text-slate-dark mb-1.5">
          Organization / Issuer
        </label>
        <input
          type="text"
          value={organization}
          onChange={(e) => setOrganization(e.target.value)}
          placeholder="e.g. IEEE, Design Week, or Tech Conference"
          className="w-full px-3.5 py-2.5 rounded-xl bg-ivory-medium border border-stone/60 text-sm text-slate-dark focus:outline-none focus:ring-1 focus:ring-slate-dark"
        />
      </div>

      {/* Date Received */}
      <div>
        <label className="block font-gothic text-xs font-bold uppercase tracking-[0.12em] text-slate-dark mb-1.5">
          Date Received
        </label>
        <input
          type="month"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-xl bg-ivory-medium border border-stone/60 text-sm text-slate-dark focus:outline-none focus:ring-1 focus:ring-slate-dark"
        />
      </div>

      {/* Link */}
      <div>
        <label className="block font-gothic text-xs font-bold uppercase tracking-[0.12em] text-slate-dark mb-1.5">
          Link (Optional)
        </label>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com/award-article"
          className="w-full px-3.5 py-2.5 rounded-xl bg-ivory-medium border border-stone/60 text-sm text-slate-dark focus:outline-none focus:ring-1 focus:ring-slate-dark"
        />
      </div>

      {/* Media URL */}
      <div>
        <label className="block font-gothic text-xs font-bold uppercase tracking-[0.12em] text-slate-dark mb-1.5">
          Image URL (Optional)
        </label>
        <input
          type="url"
          value={mediaUrl}
          onChange={(e) => setMediaUrl(e.target.value)}
          placeholder="https://example.com/image.jpg"
          className="w-full px-3.5 py-2.5 rounded-xl bg-ivory-medium border border-stone/60 text-sm text-slate-dark focus:outline-none focus:ring-1 focus:ring-slate-dark"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block font-gothic text-xs font-bold uppercase tracking-[0.12em] text-slate-dark mb-1.5">
          Description (Optional)
        </label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description of this achievement or milestone..."
          className="w-full px-3.5 py-2.5 rounded-xl bg-ivory-medium border border-stone/60 text-sm text-slate-dark focus:outline-none focus:ring-1 focus:ring-slate-dark resize-none"
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
          {isSaving ? "Saving..." : isEditing ? "Update Achievement" : "Save Achievement"}
        </Button>
      </div>
    </form>
  );
};
