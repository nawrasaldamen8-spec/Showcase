import React from "react";
import { Textarea } from "@shared/components/Textarea.tsx";

const SUGGESTED_TAGS = ["UI/UX", "Photography", "Architecture", "Branding", "Engineering", "Editorial"];

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
    <div className="bg-[#faf9f5] border border-[#cccbc8] rounded-[24px] p-6 sm:p-8 space-y-6">
      <div>
        <Textarea
          label="Exhibition Statement / Description *"
          placeholder="Articulate the context, architectural vision, photographic techniques, or design philosophy..."
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
          helperText="Anthropic Serif body copy. Captures the intellectual voice of the exhibition."
        />
      </div>

      <div className="space-y-2 pt-2 border-t border-[#cccbc8]/50">
        <label className="font-gothic text-xs font-semibold uppercase tracking-[0.10em] text-[#141413] flex items-center justify-between">
          <span>Categorical Tags</span>
          <span className="text-[#87867f] font-normal lowercase">{tags.length}/10 tags</span>
        </label>
        <div className="min-h-[46px] p-2 bg-[#f0eee6]/60 border border-[#cccbc8] rounded-xl flex flex-wrap items-center gap-1.5 focus-within:border-[#141413] focus-within:bg-[#faf9f5] transition-all">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#141413] text-[#faf9f5] font-gothic text-xs font-medium tracking-wide"
            >
              #{tag}
              <button
                type="button"
                onClick={() => onRemoveTag(tag)}
                className="hover:text-[#d97757] focus:outline-none transition-colors cursor-pointer leading-none"
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
              className="flex-1 min-w-[140px] bg-transparent border-none text-xs font-gothic text-[#141413] placeholder-[#87867f] focus:outline-none px-2 py-1"
            />
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="font-gothic text-[11px] text-[#87867f] mr-1">Suggestions:</span>
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
                    ? "opacity-40 border-[#cccbc8] bg-transparent text-[#87867f] cursor-default"
                    : "border-[#cccbc8] bg-[#faf9f5] text-[#141413] hover:border-[#141413] hover:bg-[#f0eee6]"
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
