import React, { useState } from "react";

export function usePostEditorTags(setIsDirty: (dirty: boolean) => void) {
  const [tags, setTags] = useState<string[]>([]);
  const [tagDraft, setTagDraft] = useState("");

  const handleAddTag = (rawTag: string) => {
    const cleaned = rawTag.trim().replace(/^#/, "");
    if (!cleaned) return;
    if (!tags.includes(cleaned) && tags.length < 10) {
      setTags((prev) => [...prev, cleaned]);
      setIsDirty(true);
    }
    setTagDraft("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((t) => t !== tagToRemove));
    setIsDirty(true);
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddTag(tagDraft);
    } else if (e.key === "Backspace" && !tagDraft && tags.length > 0) {
      handleRemoveTag(tags[tags.length - 1]);
    }
  };

  return {
    tags,
    setTags,
    tagDraft,
    setTagDraft,
    handleAddTag,
    handleRemoveTag,
    handleTagKeyDown,
  };
}
