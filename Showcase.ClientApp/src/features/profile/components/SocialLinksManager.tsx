import { Globe } from "lucide-react";
import React, { useState } from "react";
import { apiClient } from "@shared/api/apiClient.ts";
import type { SocialLinkDto } from "@shared/types/index.ts";
import { SUPPORTED_PLATFORMS, type SupportedPlatform } from "../constants.ts";
import { validateUrl } from "../utils.ts";
import { AddSocialLinkForm } from "./AddSocialLinkForm.tsx";
import { SocialLinkRow } from "./SocialLinkRow.tsx";

export interface SocialLinksManagerProps {
  initialLinks: SocialLinkDto[];
  onLinksChanged?: (links: SocialLinkDto[]) => void;
  onNotify?: (message: string, type?: "success" | "error") => void;
}

export const SocialLinksManager: React.FC<SocialLinksManagerProps> = ({ initialLinks, onLinksChanged, onNotify }) => {
  const [links, setLinks] = useState<SocialLinkDto[]>(() =>
    [...(initialLinks || [])].sort((a, b) => a.displayOrder - b.displayOrder),
  );
  const [isProcessing, setIsProcessing] = useState(false);

  // Inline Edit Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPlatform, setEditPlatform] = useState<SupportedPlatform>("GitHub");
  const [editUrl, setEditUrl] = useState("");
  const [editError, setEditError] = useState<string | null>(null);

  const handleAddLink = async (platform: SupportedPlatform, url: string): Promise<boolean> => {
    setIsProcessing(true);
    try {
      const nextOrder = links.length > 0 ? Math.max(...links.map((l) => l.displayOrder)) + 1 : 0;
      const res = await apiClient.addSocialLink({
        platform,
        url,
        displayOrder: nextOrder,
      });

      const newLink: SocialLinkDto = res;

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
          items: reindexed.map((l) => ({ id: l.id, displayOrder: l.displayOrder })),
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
    if (!movedItem) return;
    newOrder.splice(targetIndex, 0, movedItem);

    const updatedLinks = newOrder.map((item, idx) => ({ ...item, displayOrder: idx }));
    setLinks(updatedLinks);
    onLinksChanged?.(updatedLinks);

    try {
      await apiClient.reorderSocialLinks({
        items: updatedLinks.map((l) => ({ id: l.id, displayOrder: l.displayOrder })),
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
      className="bg-ivory-light rounded-card border border-stone/60 p-6 sm:p-8"
    >
      <div className="border-b border-stone/50 pb-5 mb-6">
        <h2
          id="social-links-heading"
          className="font-gothic text-xl sm:text-2xl font-bold uppercase tracking-tight text-slate-dark"
        >
          Social &amp; Web Links
        </h2>
        <p className="font-serif text-sm sm:text-base text-cloud-dark mt-1 leading-relaxed">
          Manage external websites and social profiles shown on your public profile.
        </p>
      </div>

      <AddSocialLinkForm onAdd={handleAddLink} isProcessing={isProcessing} />

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-gothic text-xs font-bold uppercase tracking-[0.14em] text-cloud-dark">
            Links ({links.length})
          </h3>
          {links.length > 1 && (
            <span className="font-serif text-xs text-cloud-dark">Use arrows to reorder links</span>
          )}
        </div>

        {links.length === 0 ? (
          <div className="text-center py-10 px-4 rounded-2xl border border-dashed border-stone bg-ivory-medium/30">
            <Globe className="h-8 w-8 text-cloud-dark mx-auto mb-2 opacity-60" />
            <p className="font-gothic text-xs font-semibold uppercase tracking-wider text-slate-dark">
              No Links Added
            </p>
            <p className="font-serif text-sm text-cloud-dark max-w-md mx-auto mt-1">
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
