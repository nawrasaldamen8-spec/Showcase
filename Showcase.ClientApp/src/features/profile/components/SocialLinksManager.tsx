import { Globe } from "lucide-react";
import React, { useState } from "react";
import { apiClient } from "@shared/api/apiClient.ts";
import type { SocialLinkDto } from "@shared/types/index.ts";
import { SUPPORTED_PLATFORMS, type SupportedPlatform } from "../constants.ts";
import { AddSocialLinkForm } from "./AddSocialLinkForm.tsx";
import { SocialLinkRow } from "./SocialLinkRow.tsx";

export interface SocialLinksManagerProps {
  initialLinks: SocialLinkDto[];
  onLinksChanged?: (links: SocialLinkDto[]) => void;
  onNotify?: (message: string, type?: "success" | "error") => void;
}

const validateUrl = (urlToTest: string): string | null => {
  const trimmed = urlToTest.trim();
  if (!trimmed) return "URL address is required.";
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

export const SocialLinksManager: React.FC<SocialLinksManagerProps> = ({ initialLinks, onLinksChanged, onNotify }) => {
  const [links, setLinks] = useState<SocialLinkDto[]>(() =>
    [...(initialLinks || [])].sort((a, b) => a.displayOrder - b.displayOrder),
  );
  const [prevInitialLinks, setPrevInitialLinks] = useState(initialLinks);
  const [isProcessing, setIsProcessing] = useState(false);

  // Inline Edit Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPlatform, setEditPlatform] = useState<SupportedPlatform>("GitHub");
  const [editUrl, setEditUrl] = useState("");
  const [editError, setEditError] = useState<string | null>(null);

  if (initialLinks !== prevInitialLinks) {
    setPrevInitialLinks(initialLinks);
    setLinks([...(initialLinks || [])].sort((a, b) => a.displayOrder - b.displayOrder));
  }

  const handleAddLink = async (platform: SupportedPlatform, url: string): Promise<boolean> => {
    setIsProcessing(true);
    try {
      const nextOrder = links.length > 0 ? Math.max(...links.map((l) => l.displayOrder)) + 1 : 0;
      const res = await apiClient.addSocialLink({
        platform,
        url,
        displayOrder: nextOrder,
      });

      const newLink: SocialLinkDto = {
        id: res.id,
        platform,
        url,
        displayOrder: nextOrder,
      };

      const updatedLinks = [...links, newLink].sort((a, b) => a.displayOrder - b.displayOrder);
      setLinks(updatedLinks);
      onLinksChanged?.(updatedLinks);
      onNotify?.(`Added ${platform} link.`, "success");
      return true;
    } catch (err: unknown) {
      const problem = err as { detail?: string; title?: string };
      const msg = problem?.detail || problem?.title || "Failed to add social link.";
      onNotify?.(msg, "error");
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStartEdit = (link: SocialLinkDto) => {
    setEditingId(link.id);
    const matched = SUPPORTED_PLATFORMS.includes(link.platform as SupportedPlatform)
      ? (link.platform as SupportedPlatform)
      : "Custom";
    setEditPlatform(matched);
    setEditUrl(link.url);
    setEditError(null);
  };

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

  const handleDeleteLink = async (id: string) => {
    setIsProcessing(true);
    try {
      await apiClient.deleteSocialLink(id);
      const remaining = links.filter((link) => link.id !== id);
      const reindexed = remaining.map((link, idx) => ({ ...link, displayOrder: idx }));

      setLinks(reindexed);
      onLinksChanged?.(reindexed);
      onNotify?.("Social link removed.", "success");

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

  const handleMove = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= links.length) return;

    const newOrder = [...links];
    const [movedItem] = newOrder.splice(index, 1);
    newOrder.splice(targetIndex, 0, movedItem);

    const updatedLinks = newOrder.map((item, idx) => ({ ...item, displayOrder: idx }));
    setLinks(updatedLinks);
    onLinksChanged?.(updatedLinks);

    try {
      await apiClient.reorderSocialLinks({
        orderedIds: updatedLinks.map((l) => l.id),
      });
      onNotify?.("Links reordered.", "success");
    } catch (err: unknown) {
      console.error("Reorder error:", err);
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
          Social &amp; Web Links
        </h2>
        <p className="font-serif text-sm sm:text-base text-[#87867f] mt-1 leading-relaxed">
          Manage external websites and social profiles shown on your public profile.
        </p>
      </div>

      <AddSocialLinkForm onAdd={handleAddLink} isProcessing={isProcessing} />

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-gothic text-xs font-bold uppercase tracking-[0.14em] text-[#87867f]">
            Links ({links.length})
          </h3>
          {links.length > 1 && (
            <span className="font-serif text-xs text-[#87867f]">Use arrows to reorder links</span>
          )}
        </div>

        {links.length === 0 ? (
          <div className="text-center py-10 px-4 rounded-2xl border border-dashed border-[#cccbc8] bg-[#f0eee6]/30">
            <Globe className="h-8 w-8 text-[#87867f] mx-auto mb-2 opacity-60" />
            <p className="font-gothic text-xs font-semibold uppercase tracking-wider text-[#141413]">
              No Links Added
            </p>
            <p className="font-serif text-sm text-[#87867f] max-w-md mx-auto mt-1">
              Add your portfolio, GitHub, LinkedIn, or social profiles so visitors can connect with you.
            </p>
          </div>
        ) : (
          <ul className="space-y-3" aria-label="Social links">
            {links.map((link, index) => (
              <SocialLinkRow
                key={link.id}
                link={link}
                index={index}
                totalLinks={links.length}
                isEditing={editingId === link.id}
                isProcessing={isProcessing}
                editPlatform={editPlatform}
                editUrl={editUrl}
                editError={editError}
                onStartEdit={handleStartEdit}
                onCancelEdit={() => {
                  setEditingId(null);
                  setEditError(null);
                }}
                onSaveEdit={handleSaveEdit}
                onDelete={handleDeleteLink}
                onMove={handleMove}
                onEditPlatformChange={setEditPlatform}
                onEditUrlChange={(val) => {
                  setEditUrl(val);
                  if (editError) setEditError(null);
                }}
              />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};
