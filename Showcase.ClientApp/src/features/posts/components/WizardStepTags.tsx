import React from "react";
import { Plus, Tag, X } from "lucide-react";
import { SUGGESTED_TAG_CATEGORIES } from "../constants.ts";

export interface WizardStepTagsProps {
  tags: string[];
  tagDraft: string;
  setTagDraft: (val: string) => void;
  onAddTag: (rawTag: string) => void;
  onRemoveTag: (tag: string) => void;
  onTagKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  setIsDirty: (dirty: boolean) => void;
}

export const WizardStepTags: React.FC<WizardStepTagsProps> = ({
  tags,
  tagDraft,
  setTagDraft,
  onAddTag,
  onRemoveTag,
  onTagKeyDown,
  setIsDirty,
}) => {
  const maxTags = 10;
  const canAddMore = tags.length < maxTags;

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (tagDraft.trim() && canAddMore) {
      onAddTag(tagDraft);
      setIsDirty(true);
    }
  };

  const handleSuggestedClick = (suggested: string) => {
    if (tags.includes(suggested)) {
      onRemoveTag(suggested);
    } else if (canAddMore) {
      onAddTag(suggested);
      setIsDirty(true);
    }
  };

  return (
    <div className="bg-ivory-light border border-stone rounded-card p-6 sm:p-8 space-y-8 shadow-none">
      <div className="space-y-1.5 border-b border-stone/50 pb-5">
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-clay" />
          <h3 className="font-gothic font-bold text-base sm:text-lg uppercase tracking-tight text-slate-dark">
            Architectural Taxonomy &amp; Tags
          </h3>
        </div>
        <p className="font-serif text-sm text-slate-dark/75 leading-relaxed">
          Tagging classifies your monograph within the public feed and curated search indexes.
          Add up to 10 descriptive tags for typology, materiality, or conceptual method.
        </p>
      </div>

      {/* Tag Input Form */}
      <form onSubmit={handleManualAdd} className="space-y-3">
        <div className="flex items-center justify-between">
          <label
            htmlFor="tag-input"
            className="font-gothic text-xs font-bold uppercase tracking-wider text-slate-dark"
          >
            Add Custom Tag
          </label>
          <span className="font-serif text-xs text-cloud-dark tabular-nums">
            {tags.length} / {maxTags} selected
          </span>
        </div>

        <div className="flex items-center gap-2">
          <input
            id="tag-input"
            type="text"
            placeholder={canAddMore ? "e.g. Mass Timber, Adaptive Reuse (press Enter or Comma)" : "Maximum tag limit reached"}
            value={tagDraft}
            disabled={!canAddMore}
            onChange={(e) => setTagDraft(e.target.value)}
            onKeyDown={onTagKeyDown}
            className="flex-1 px-4 py-2.5 rounded-xl border border-stone bg-ivory-light font-serif text-sm text-slate-dark placeholder-cloud-dark/70 focus:border-slate-dark focus:outline-none transition-colors disabled:opacity-50 disabled:bg-ivory-medium min-h-[46px]"
          />
          <button
            type="submit"
            disabled={!tagDraft.trim() || !canAddMore}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-dark hover:bg-slate-dark/90 text-ivory-light font-gothic text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed min-h-[46px]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </form>

      {/* Selected Tags Display */}
      <div className="space-y-2">
        <span className="font-gothic text-[11px] font-bold uppercase tracking-wider text-cloud-dark block">
          Current Project Tags ({tags.length})
        </span>

        {tags.length > 0 ? (
          <div className="flex flex-wrap gap-2 p-3 rounded-2xl bg-ivory-medium/40 border border-stone/60 min-h-[50px] items-center">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-clay/10 text-clay border border-clay/30 font-gothic text-xs font-semibold uppercase tracking-wider animate-in fade-in zoom-in-95 duration-100"
              >
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={() => onRemoveTag(tag)}
                  className="hover:text-slate-dark transition-colors p-0.5 rounded-full cursor-pointer focus:outline-none"
                  aria-label={`Remove tag ${tag}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-2xl border border-dashed border-stone text-center font-serif text-xs text-cloud-dark">
            No tags selected yet. Type a tag above or select from the curated suggestions below.
          </div>
        )}
      </div>

      {/* Curated Suggested Taxonomies */}
      <div className="space-y-4 pt-2 border-t border-stone/50">
        <div className="space-y-1">
          <span className="font-gothic text-[11px] font-bold uppercase tracking-wider text-slate-dark block">
            Curated Discipline Taxonomies (Tap to Toggle)
          </span>
          <p className="font-serif text-xs text-cloud-dark">
            Standard taxonomy categories recognized by exhibition filters.
          </p>
        </div>

        <div className="space-y-4">
          {SUGGESTED_TAG_CATEGORIES.map((cat) => (
            <div key={cat.category} className="space-y-2">
              <span className="font-gothic text-[10px] font-bold uppercase tracking-[0.12em] text-cloud-dark block">
                {cat.category}
              </span>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {cat.tags.map((suggested) => {
                  const isSelected = tags.includes(suggested);
                  return (
                    <button
                      key={suggested}
                      type="button"
                      onClick={() => handleSuggestedClick(suggested)}
                      disabled={!isSelected && !canAddMore}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full font-gothic text-[11px] font-semibold uppercase tracking-wider transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed select-none min-h-[36px] ${
                        isSelected
                          ? "bg-slate-dark text-ivory-light border border-slate-dark scale-102"
                          : "bg-ivory-medium/80 hover:bg-ivory-medium text-slate-dark/80 hover:text-slate-dark border border-stone/70"
                      }`}
                    >
                      {isSelected ? <X className="w-3 h-3 text-clay" /> : <Plus className="w-3 h-3 text-cloud-dark" />}
                      <span>{suggested}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
