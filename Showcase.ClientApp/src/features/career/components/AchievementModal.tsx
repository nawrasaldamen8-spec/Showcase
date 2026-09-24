import { Image as ImageIcon, Link as LinkIcon, Trophy, X } from "lucide-react";
import React, { useState } from "react";
import { Button } from "../../../shared/components/Button.tsx";
import type { CareerAchievement } from "../../../shared/types/index.ts";

export interface AchievementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<CareerAchievement, "id" | "createdAt">) => Promise<void>;
  initialData?: CareerAchievement | null;
  isSaving?: boolean;
}

const ACHIEVEMENT_TYPES = ["Award", "Publication", "Exhibition", "Fellowship", "Grant", "Honor"];

const AchievementModalForm: React.FC<Omit<AchievementModalProps, "isOpen">> = ({
  onClose,
  onSave,
  initialData,
  isSaving = false,
}) => {
  const [title, setTitle] = useState(initialData?.title || "");
  const [type, setType] = useState(initialData?.type || "Award");
  const [date, setDate] = useState(initialData?.date || "");
  const [organization, setOrganization] = useState(initialData?.organization || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [url, setUrl] = useState(initialData?.url || "");
  const [mediaUrl, setMediaUrl] = useState(initialData?.mediaUrl || "");

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ title: true });
    if (!validate()) return;

    await onSave({
      title: title.trim(),
      type: type.trim() || undefined,
      date: date.trim() || undefined,
      organization: organization.trim() || undefined,
      description: description.trim() || undefined,
      url: url.trim() || undefined,
      mediaUrl: mediaUrl.trim() || undefined,
    });
  };

  return (
    <div className="relative w-full max-w-xl my-8 rounded-[24px] bg-[#faf9f5] border border-[#cccbc8] p-6 sm:p-8 shadow-none text-[#141413]">
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
          <Trophy className="w-5 h-5 stroke-[1.75]" />
        </div>
        <div>
          <span className="font-gothic text-[10px] font-bold uppercase tracking-[0.2em] text-[#87867f] block">
            Editorial Recognition
          </span>
          <h2 id="achievement-modal-title" className="font-gothic text-xl font-bold uppercase tracking-tight text-[#141413]">
            {initialData ? "Edit Achievement" : "Honor / Milestone"}
          </h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title */}
        <div>
          <label className="block font-gothic text-xs font-bold uppercase tracking-[0.12em] text-[#141413] mb-1.5">
            Distinction Title <span className="text-[#d97757]">*</span>
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

        {/* Type & Organization */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-gothic text-xs font-bold uppercase tracking-[0.12em] text-[#141413] mb-1.5">
              Type
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

          <div>
            <label className="block font-gothic text-xs font-bold uppercase tracking-[0.12em] text-[#141413] mb-1.5">
              Conferring Body / Organization
            </label>
            <input
              type="text"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              placeholder="e.g. Venice Biennale of Architecture"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#f0eee6] border border-[#cccbc8]/60 text-sm text-[#141413] focus:outline-none focus:ring-1 focus:ring-[#141413]"
            />
          </div>
        </div>

        {/* Date & URL */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-gothic text-xs font-bold uppercase tracking-[0.12em] text-[#141413] mb-1.5">
              Date / Year
            </label>
            <input
              type="month"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#f0eee6] border border-[#cccbc8]/60 text-sm text-[#141413] focus:outline-none focus:ring-1 focus:ring-[#141413]"
            />
          </div>

          <div>
            <label className="block font-gothic text-xs font-bold uppercase tracking-[0.12em] text-[#141413] mb-1.5">
              Reference / Citation URL
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#87867f]">
                <LinkIcon className="w-4 h-4" />
              </span>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.labiennale.org"
                className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-[#f0eee6] border border-[#cccbc8]/60 text-sm text-[#141413] focus:outline-none focus:ring-1 focus:ring-[#141413]"
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block font-gothic text-xs font-bold uppercase tracking-[0.12em] text-[#141413] mb-1.5">
            Description &amp; Critical Context
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Outline the significance, review citations, or juror notes..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#f0eee6] border border-[#cccbc8]/60 text-sm text-[#141413] focus:outline-none focus:ring-1 focus:ring-[#141413] resize-none"
          />
        </div>

        {/* Media URL */}
        <div>
          <label className="block font-gothic text-xs font-bold uppercase tracking-[0.12em] text-[#141413] mb-1.5">
            Exhibition Artwork / Catalogue Cover URL
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#87867f]">
              <ImageIcon className="w-4 h-4" />
            </span>
            <input
              type="url"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              placeholder="https://images.unsplash.com/... or asset URL"
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-[#f0eee6] border border-[#cccbc8]/60 text-sm text-[#141413] focus:outline-none focus:ring-1 focus:ring-[#141413]"
            />
          </div>
          {mediaUrl && (
            <div className="mt-2.5 p-2 rounded-xl bg-[#f0eee6] border border-[#cccbc8]/60 max-w-xs overflow-hidden">
              <img
                src={mediaUrl}
                alt="Achievement Preview"
                className="w-full h-32 object-cover rounded-lg"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            </div>
          )}
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
            {isSaving ? "Saving..." : initialData ? "Update Achievement" : "Save Achievement"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export const AchievementModal: React.FC<AchievementModalProps> = ({
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
      aria-labelledby="achievement-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#141413]/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150"
    >
      <AchievementModalForm
        key={initialData?.id || "new-achievement"}
        onClose={onClose}
        onSave={onSave}
        initialData={initialData}
        isSaving={isSaving}
      />
    </div>
  );
};
