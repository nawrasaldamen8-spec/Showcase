import React from "react";
import { Textarea } from "@shared/components/Textarea.tsx";
import { SUGGESTED_TAGS } from "../constants.ts";

export interface WizardStepEditorialProps {
  description: string;
  setDescription: (val: string) => void;
  descriptionError: string | null;
  setDescriptionError: (msg: string | null) => void;
  tags: string[];
  tagDraft: string;
  setTagDraft: (val: string) => void;
  onAddTag: (rawTag: string) => void;
  onRemoveTag: (tag: string) => void;
  onTagKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  setIsDirty: (dirty: boolean) => void;
}

export const WizardStepEditorial: React.FC<WizardStepEditorialProps> = ({
  description,
  setDescription,
  descriptionError,
  setDescriptionError,
  tags,
  tagDraft,
  setTagDraft,
  onAddTag,
  onRemoveTag,
  onTagKeyDown,
  setIsDirty,
}) => {
  return (
    <div className="bg-ivory-light border border-stone rounded-card p-6 sm:p-8 space-y-6">
      <div>
        <Textarea
          label="Project Description *"
          placeholder="Describe the background, approach, key outcomes, or technologies used..."
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            setIsDirty(true);
            if (descriptionError) setDescriptionError(null);
          }}
          rows={7}
          showCount
          maxLength={2000}
          errorMessage={descriptionError || undefined}
          helperText="Detailed overview of your project, role, and results."
        />
      </div>

      <div className="space-y-2 pt-2 border-t border-stone/50">
        <label className="font-gothic text-xs font-semibold uppercase tracking-[0.10em] text-slate-dark flex items-center justify-between">
          <span>Tags</span>
          <span className="text-cloud-dark font-normal lowercase">{tags.length}/10 tags</span>
        </label>
        <div className="min-h-[46px] p-2 bg-ivory-medium/60 border border-stone rounded-xl flex flex-wrap items-center gap-1.5 focus-within:border-slate-dark focus-within:bg-ivory-light transition-all">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-dark text-ivory-light font-gothic text-xs font-medium tracking-wide"
            >
              #{tag}
              <button
                type="button"
                onClick={() => onRemoveTag(tag)}
                className="hover:text-clay focus:outline-none transition-colors cursor-pointer leading-none"
                aria-label={`Remove tag ${tag}`}
              >
                &times;
              </button>
            </span>
          ))}
          {tags.length < 10 && (
            <input
              type="text"
              placeholder={tags.length === 0 ? "Type tag & press Enter or comma..." : "Add another..."}
              value={tagDraft}
              onChange={(e) => setTagDraft(e.target.value)}
              onKeyDown={onTagKeyDown}
              onBlur={() => {
                if (tagDraft.trim()) onAddTag(tagDraft);
              }}
              className="flex-1 min-w-[140px] bg-transparent border-none text-xs font-gothic text-slate-dark placeholder-cloud-dark focus:outline-none px-2 py-1"
            />
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="font-gothic text-[11px] text-cloud-dark mr-1">Suggestions:</span>
          {SUGGESTED_TAGS.map((sug) => {
            const isSelected = tags.includes(sug);
            return (
              <button
                key={sug}
                type="button"
                disabled={isSelected || tags.length >= 10}
                onClick={() => onAddTag(sug)}
                className={`font-gothic text-[11px] px-2.5 py-0.5 rounded-full border transition-all cursor-pointer ${
                  isSelected
                    ? "opacity-40 border-stone bg-transparent text-cloud-dark cursor-default"
                    : "border-stone bg-ivory-light text-slate-dark hover:border-slate-dark hover:bg-ivory-medium"
                }`}
              >
                +{sug}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
