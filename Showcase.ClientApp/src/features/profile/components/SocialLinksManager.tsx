import { Globe } from "lucide-react";
import React, { useState } from "react";
import type { SocialLinkDto } from "@shared/types/index.ts";
import { SUPPORTED_PLATFORMS, type SupportedPlatform } from "../constants.ts";
import { validateUrl } from "../utils.ts";
import {
  useAddSocialLinkMutation,
  useDeleteSocialLinkMutation,
  useReorderSocialLinksMutation,
  useUpdateSocialLinkMutation,
} from "../hooks/useProfileQueries.ts";
import { AddSocialLinkForm } from "./AddSocialLinkForm.tsx";
import { SocialLinkRow } from "./SocialLinkRow.tsx";

export interface SocialLinksManagerProps {
  links: SocialLinkDto[];
}

export const SocialLinksManager: React.FC<SocialLinksManagerProps> = ({ links }) => {
  const addMutation = useAddSocialLinkMutation();
  const updateMutation = useUpdateSocialLinkMutation();
  const deleteMutation = useDeleteSocialLinkMutation();
  const reorderMutation = useReorderSocialLinksMutation();

  const isProcessing =
    addMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending ||
    reorderMutation.isPending;

  const sortedLinks = [...(links || [])].sort((a, b) => a.displayOrder - b.displayOrder);

  // Inline Edit Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPlatform, setEditPlatform] = useState<SupportedPlatform>("GitHub");
  const [editUrl, setEditUrl] = useState("");
  const [editError, setEditError] = useState<string | null>(null);

  const handleAddLink = async (platform: SupportedPlatform, url: string): Promise<boolean> => {
    try {
      const nextOrder = sortedLinks.length > 0 ? Math.max(...sortedLinks.map((l) => l.displayOrder)) + 1 : 0;
      await addMutation.mutateAsync({
        platform,
        url,
        displayOrder: nextOrder,
      });
      return true;
    } catch {
      return false;
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

    try {
      await updateMutation.mutateAsync({
        id,
        data: {
          platform: editPlatform,
          url: editUrl.trim(),
        },
      });
      setEditingId(null);
    } catch (err: unknown) {
      const problem = err as { detail?: string; title?: string };
      setEditError(problem?.detail || problem?.title || "Failed to update social link.");
    }
  };

  const handleDeleteLink = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
    } catch {
      // Handled by mutation toast
    }
  };

  const handleMove = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sortedLinks.length) return;

    const newOrder = [...sortedLinks];
    const [movedItem] = newOrder.splice(index, 1);
    if (!movedItem) return;
    newOrder.splice(targetIndex, 0, movedItem);

    const reorderedPayload = newOrder.map((item, idx) => ({ id: item.id, displayOrder: idx }));

    try {
      await reorderMutation.mutateAsync({ items: reorderedPayload });
    } catch {
      // Handled by mutation toast
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
            Links ({sortedLinks.length})
          </h3>
          {sortedLinks.length > 1 && (
            <span className="font-serif text-xs text-cloud-dark">Use arrows to reorder links</span>
          )}
        </div>

        {sortedLinks.length === 0 ? (
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
            {sortedLinks.map((link, index) => (
              <SocialLinkRow
                key={link.id}
                link={link}
                index={index}
                totalLinks={sortedLinks.length}
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
