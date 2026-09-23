import { ArrowDown, ArrowUp, Check, Edit2, ExternalLink, Globe, Plus, Trash2, X } from "lucide-react";
import React, { useState } from "react";
import { apiClient } from "../../../shared/api/apiClient.ts";
import { Button } from "../../../shared/components/Button.tsx";
import { Input } from "../../../shared/components/Input.tsx";
import type { SocialLinkDto } from "../../../shared/types/index.ts";
import { PlatformIcon } from "./PlatformIcon.tsx";

export interface SocialLinksManagerProps {
  initialLinks: SocialLinkDto[];
  onLinksChanged?: (links: SocialLinkDto[]) => void;
  onNotify?: (message: string, type?: "success" | "error") => void;
}

const SUPPORTED_PLATFORMS = [
  "GitHub",
  "LinkedIn",
  "Website",
  "Behance",
  "Dribbble",
  "X",
  "Instagram",
  "Custom",
] as const;

type SupportedPlatform = (typeof SUPPORTED_PLATFORMS)[number];

const PLATFORM_PLACEHOLDERS: Record<string, string> = {
  GitHub: "https://github.com/yourusername",
  LinkedIn: "https://linkedin.com/in/yourusername",
  Website: "https://yourportfolio.com",
  Behance: "https://behance.net/yourusername",
  Dribbble: "https://dribbble.com/yourusername",
  X: "https://x.com/yourhandle",
  Instagram: "https://instagram.com/yourhandle",
  Custom: "https://external-archive.org/profile",
};

export const SocialLinksManager: React.FC<SocialLinksManagerProps> = ({ initialLinks, onLinksChanged, onNotify }) => {
  const [links, setLinks] = useState<SocialLinkDto[]>(() =>
    [...(initialLinks || [])].sort((a, b) => a.displayOrder - b.displayOrder),
  );
  const [prevInitialLinks, setPrevInitialLinks] = useState(initialLinks);
  const [isProcessing, setIsProcessing] = useState(false);

  // New Link Form State
  const [platform, setPlatform] = useState<SupportedPlatform>("GitHub");
  const [url, setUrl] = useState("");
  const [addError, setAddError] = useState<string | null>(null);

  // Inline Edit Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPlatform, setEditPlatform] = useState<SupportedPlatform>("GitHub");
  const [editUrl, setEditUrl] = useState("");
  const [editError, setEditError] = useState<string | null>(null);

  // Sync state if initialLinks prop changes without triggering cascading renders
  if (initialLinks !== prevInitialLinks) {
    setPrevInitialLinks(initialLinks);
    setLinks([...(initialLinks || [])].sort((a, b) => a.displayOrder - b.displayOrder));
  }

  // Validate URL format conforming to backend rules
  const validateUrl = (urlToTest: string): string | null => {
    const trimmed = urlToTest.trim();
    if (!trimmed) {
      return "URL address is required.";
    }
    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
      return "URL must begin with http:// or https://";
    }
    try {
      new URL(trimmed);
      return null;
    } catch {
      return "Please enter a valid, well-formed web address.";
    }
  };

  // Add Link Handler
  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);

    const validationMsg = validateUrl(url);
    if (validationMsg) {
      setAddError(validationMsg);
      return;
    }

    setIsProcessing(true);

    try {
      const nextOrder = links.length > 0 ? Math.max(...links.map((l) => l.displayOrder)) + 1 : 0;
      const res = await apiClient.addSocialLink({
        platform,
        url: url.trim(),
        displayOrder: nextOrder,
      });

      const newLink: SocialLinkDto = {
        id: res.id,
        platform,
        url: url.trim(),
        displayOrder: nextOrder,
      };

      const updatedLinks = [...links, newLink].sort((a, b) => a.displayOrder - b.displayOrder);
      setLinks(updatedLinks);
      setUrl("");
      onLinksChanged?.(updatedLinks);
      onNotify?.(`Added ${platform} profile link.`, "success");
    } catch (err: unknown) {
      const problem = err as { detail?: string; title?: string };
      const msg = problem?.detail || problem?.title || "Failed to add social link.";
      setAddError(msg);
      onNotify?.(msg, "error");
    } finally {
      setIsProcessing(false);
    }
  };

  // Inline Edit Trigger
  const handleStartEdit = (link: SocialLinkDto) => {
    setEditingId(link.id);
    const matchedPlatform = SUPPORTED_PLATFORMS.includes(link.platform as SupportedPlatform)
      ? (link.platform as SupportedPlatform)
      : "Custom";
    setEditPlatform(matchedPlatform);
    setEditUrl(link.url);
    setEditError(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditError(null);
  };

  // Save Inline Edit
  const handleSaveEdit = async (id: string) => {
    setEditError(null);
    const validationMsg = validateUrl(editUrl);
    if (validationMsg) {
      setEditError(validationMsg);
      return;
    }

    setIsProcessing(true);

    try {
      await apiClient.updateSocialLink(id, {
        platform: editPlatform,
        url: editUrl.trim(),
      });

      const updatedLinks = links.map((link) =>
        link.id === id ? { ...link, platform: editPlatform, url: editUrl.trim() } : link,
      );
      setLinks(updatedLinks);
      setEditingId(null);
      onLinksChanged?.(updatedLinks);
      onNotify?.(`Updated ${editPlatform} link.`, "success");
    } catch (err: unknown) {
      const problem = err as { detail?: string; title?: string };
      const msg = problem?.detail || problem?.title || "Failed to update social link.";
      setEditError(msg);
      onNotify?.(msg, "error");
    } finally {
      setIsProcessing(false);
    }
  };

  // Delete Link
  const handleDeleteLink = async (id: string) => {
    setIsProcessing(true);

    try {
      await apiClient.deleteSocialLink(id);
      const remaining = links.filter((link) => link.id !== id);

      // Re-index remaining links
      const reindexed = remaining.map((link, idx) => ({
        ...link,
        displayOrder: idx,
      }));

      setLinks(reindexed);
      onLinksChanged?.(reindexed);
      onNotify?.("Social link removed.", "success");

      // Update backend reorder if any items remained
      if (reindexed.length > 0) {
        await apiClient.reorderSocialLinks({
          orderedIds: reindexed.map((l) => l.id),
        });
      }
    } catch (err: unknown) {
      const problem = err as { detail?: string; title?: string };
      const msg = problem?.detail || problem?.title || "Failed to delete social link.";
      onNotify?.(msg, "error");
    } finally {
      setIsProcessing(false);
    }
  };

  // Reorder Handler (Move Up / Down)
  const handleMove = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= links.length) return;

    const newOrder = [...links];
    const [movedItem] = newOrder.splice(index, 1);
    newOrder.splice(targetIndex, 0, movedItem);

    // Update displayOrder numbers
    const updatedLinks = newOrder.map((item, idx) => ({
      ...item,
      displayOrder: idx,
    }));

    setLinks(updatedLinks);
    onLinksChanged?.(updatedLinks);

    try {
      await apiClient.reorderSocialLinks({
        orderedIds: updatedLinks.map((l) => l.id),
      });
      onNotify?.("Links reordered.", "success");
    } catch (err: unknown) {
      console.error("Reorder error:", err);
      // Revert if API fails
      setLinks(links);
      onNotify?.("Failed to persist link order.", "error");
    }
  };

  return (
    <section
      aria-labelledby="social-links-heading"
      className="bg-[#faf9f5] rounded-[24px] border border-[#cccbc8]/60 p-6 sm:p-8"
    >
      <div className="border-b border-[#cccbc8]/50 pb-5 mb-6">
        <h2
          id="social-links-heading"
          className="font-gothic text-xl sm:text-2xl font-bold uppercase tracking-tight text-[#141413]"
        >
          Curated Social &amp; Portfolio Links
        </h2>
        <p className="font-serif text-sm sm:text-base text-[#87867f] mt-1 leading-relaxed">
          Order and manage external channels displayed on your artist showcase. Use reorder arrows to curate the
          hierarchy.
        </p>
      </div>

      {/* Add New Link Section */}
      <div className="bg-[#f0eee6]/50 rounded-2xl border border-[#cccbc8]/50 p-4 sm:p-6 mb-8">
        <h3 className="font-gothic text-xs font-bold uppercase tracking-[0.14em] text-[#141413] mb-4">
          Add New Channel
        </h3>

        <form onSubmit={handleAddLink} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 items-end">
            {/* Platform Dropdown */}
            <div className="flex flex-col">
              <label
                htmlFor="platform-select"
                className="text-label text-[#87867f] mb-1.5 font-gothic text-[12px] font-semibold uppercase tracking-[0.10em]"
              >
                Platform
              </label>
              <select
                id="platform-select"
                value={platform}
                onChange={(e) => setPlatform(e.target.value as SupportedPlatform)}
                disabled={isProcessing}
                className="w-full bg-[#faf9f5] text-[#141413] font-gothic text-xs font-semibold uppercase tracking-wider border border-[#cccbc8] rounded-lg px-3.5 py-3 outline-none transition-colors duration-150 focus:border-[#141413] disabled:opacity-50 cursor-pointer"
              >
                {SUPPORTED_PLATFORMS.map((plat) => (
                  <option key={plat} value={plat}>
                    {plat}
                  </option>
                ))}
              </select>
            </div>

            {/* URL Input */}
            <div className="sm:col-span-2">
              <Input
                label="Target URL (http:// or https://)"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  if (addError) setAddError(null);
                }}
                placeholder={PLATFORM_PLACEHOLDERS[platform] || "https://..."}
                errorMessage={addError || undefined}
                disabled={isProcessing}
                leftIcon={<PlatformIcon platform={platform} className="h-4 w-4 text-[#87867f]" />}
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <Button
              type="submit"
              variant="clay"
              size="sm"
              isLoading={isProcessing && !editingId}
              disabled={!url.trim()}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Add Channel Link
            </Button>
          </div>
        </form>
      </div>

      {/* Existing Social Links List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-gothic text-xs font-bold uppercase tracking-[0.14em] text-[#87867f]">
            Active Channels ({links.length})
          </h3>
          {links.length > 1 && (
            <span className="font-serif text-xs text-[#87867f]">Use arrows to adjust display precedence</span>
          )}
        </div>

        {links.length === 0 ? (
          <div className="text-center py-10 px-4 rounded-2xl border border-dashed border-[#cccbc8] bg-[#f0eee6]/30">
            <Globe className="h-8 w-8 text-[#87867f] mx-auto mb-2 opacity-60" />
            <p className="font-gothic text-xs font-semibold uppercase tracking-wider text-[#141413]">
              No External Channels Linked
            </p>
            <p className="font-serif text-sm text-[#87867f] max-w-md mx-auto mt-1">
              Add your portfolio, GitHub, Behance, or social handles to enable visitors to discover your broader work.
            </p>
          </div>
        ) : (
          <ul className="space-y-3" aria-label="Curated social links">
            {links.map((link, index) => {
              const isEditing = editingId === link.id;

              return (
                <li
                  key={link.id}
                  className="bg-[#faf9f5] border border-[#cccbc8] rounded-xl p-3.5 sm:p-4 transition-colors hover:border-[#141413]/60"
                >
                  {isEditing ? (
                    /* Inline Editing Mode */
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="text-label text-[#87867f] mb-1 font-gothic text-[11px] font-semibold uppercase tracking-wider block">
                            Platform
                          </label>
                          <select
                            value={editPlatform}
                            onChange={(e) => setEditPlatform(e.target.value as SupportedPlatform)}
                            className="w-full bg-[#faf9f5] text-[#141413] font-gothic text-xs font-semibold uppercase tracking-wider border border-[#cccbc8] rounded-lg px-3 py-2 outline-none focus:border-[#141413]"
                          >
                            {SUPPORTED_PLATFORMS.map((plat) => (
                              <option key={plat} value={plat}>
                                {plat}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="sm:col-span-2">
                          <label className="text-label text-[#87867f] mb-1 font-gothic text-[11px] font-semibold uppercase tracking-wider block">
                            URL
                          </label>
                          <Input
                            value={editUrl}
                            onChange={(e) => {
                              setEditUrl(e.target.value);
                              if (editError) setEditError(null);
                            }}
                            placeholder="https://..."
                            errorMessage={editError || undefined}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleCancelEdit}
                          leftIcon={<X className="h-3.5 w-3.5" />}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          variant="slate"
                          size="sm"
                          onClick={() => handleSaveEdit(link.id)}
                          isLoading={isProcessing}
                          leftIcon={<Check className="h-3.5 w-3.5" />}
                        >
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    /* Standard Row Mode */
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                      {/* Left: Reorder controls + platform icon + title */}
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Reorder Buttons */}
                        <div className="flex sm:flex-col items-center gap-0.5 shrink-0 bg-[#f0eee6] rounded-lg p-0.5 border border-[#cccbc8]/60">
                          <button
                            type="button"
                            aria-label={`Move ${link.platform} link up`}
                            onClick={() => handleMove(index, "up")}
                            disabled={index === 0 || isProcessing}
                            className="p-1 text-[#87867f] hover:text-[#141413] disabled:opacity-20 disabled:hover:text-[#87867f] transition-colors rounded cursor-pointer disabled:cursor-not-allowed"
                          >
                            <ArrowUp className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            aria-label={`Move ${link.platform} link down`}
                            onClick={() => handleMove(index, "down")}
                            disabled={index === links.length - 1 || isProcessing}
                            className="p-1 text-[#87867f] hover:text-[#141413] disabled:opacity-20 disabled:hover:text-[#87867f] transition-colors rounded cursor-pointer disabled:cursor-not-allowed"
                          >
                            <ArrowDown className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {/* Platform Badge & Icon */}
                        <div className="p-2 rounded-full bg-[#f0eee6] border border-[#cccbc8]/70 text-[#141413] shrink-0">
                          <PlatformIcon platform={link.platform} className="h-4 w-4" />
                        </div>

                        {/* Title and URL */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-gothic text-xs font-bold uppercase tracking-wider text-[#141413]">
                              {link.platform}
                            </span>
                            <span className="font-gothic text-[10px] uppercase text-[#87867f] bg-[#f0eee6] px-1.5 py-0.5 rounded">
                              #{index + 1}
                            </span>
                          </div>
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-serif text-xs text-[#87867f] hover:text-[#141413] transition-colors flex items-center gap-1 truncate max-w-xs sm:max-w-md mt-0.5"
                          >
                            <span className="truncate">{link.url}</span>
                            <ExternalLink className="h-3 w-3 shrink-0 opacity-70" />
                          </a>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStartEdit(link)}
                          aria-label={`Edit ${link.platform} link`}
                          leftIcon={<Edit2 className="h-3.5 w-3.5" />}
                        >
                          Edit
                        </Button>

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteLink(link.id)}
                          aria-label={`Delete ${link.platform} link`}
                          leftIcon={<Trash2 className="h-3.5 w-3.5 text-[#d97757]" />}
                          className="hover:text-[#d97757] hover:bg-[#d97757]/10"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
};
