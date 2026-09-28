import { ArrowDown, ArrowUp, Check, Edit2, ExternalLink, Trash2, X } from "lucide-react";
import React from "react";
import { Button } from "@shared/components/Button.tsx";
import { Input } from "@shared/components/Input.tsx";
import type { SocialLinkDto } from "@shared/types/index.ts";
import { SUPPORTED_PLATFORMS, type SupportedPlatform } from "../constants.ts";
import { PlatformIcon } from "./PlatformIcon.tsx";

export interface SocialLinkRowProps {
  link: SocialLinkDto;
  index: number;
  totalLinks: number;
  isEditing: boolean;
  isProcessing: boolean;
  editPlatform: SupportedPlatform;
  editUrl: string;
  editError: string | null;
  onStartEdit: (link: SocialLinkDto) => void;
  onCancelEdit: () => void;
  onSaveEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onMove: (index: number, direction: "up" | "down") => void;
  onEditPlatformChange: (platform: SupportedPlatform) => void;
  onEditUrlChange: (url: string) => void;
}

export const SocialLinkRow: React.FC<SocialLinkRowProps> = ({
  link,
  index,
  totalLinks,
  isEditing,
  isProcessing,
  editPlatform,
  editUrl,
  editError,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
  onMove,
  onEditPlatformChange,
  onEditUrlChange,
}) => {
  return (
    <li className="bg-ivory-light border border-stone rounded-xl p-3.5 sm:p-4 transition-colors hover:border-slate-dark/60">
      {isEditing ? (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-label text-cloud-dark mb-1 font-gothic text-[11px] font-semibold uppercase tracking-wider block">
                Platform
              </label>
              <select
                value={editPlatform}
                onChange={(e) => onEditPlatformChange(e.target.value as SupportedPlatform)}
                className="w-full bg-ivory-light text-slate-dark font-gothic text-xs font-semibold uppercase tracking-wider border border-stone rounded-lg px-3 py-2 outline-none focus:border-slate-dark"
              >
                {SUPPORTED_PLATFORMS.map((plat) => (
                  <option key={plat} value={plat}>
                    {plat}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="text-label text-cloud-dark mb-1 font-gothic text-[11px] font-semibold uppercase tracking-wider block">
                URL
              </label>
              <Input
                value={editUrl}
                onChange={(e) => onEditUrlChange(e.target.value)}
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
              onClick={onCancelEdit}
              leftIcon={<X className="h-3.5 w-3.5" />}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="slate"
              size="sm"
              onClick={() => onSaveEdit(link.id)}
              isLoading={isProcessing}
              leftIcon={<Check className="h-3.5 w-3.5" />}
            >
              Save
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3 min-w-0 flex-1 w-full sm:w-auto">
            <div className="flex sm:flex-col items-center gap-0.5 shrink-0 bg-ivory-medium rounded-lg p-0.5 border border-stone/60">
              <button
                type="button"
                aria-label={`Move ${link.platform} link up`}
                onClick={() => onMove(index, "up")}
                disabled={index === 0 || isProcessing}
                className="p-1 text-cloud-dark hover:text-slate-dark disabled:opacity-20 disabled:hover:text-cloud-dark transition-colors rounded cursor-pointer disabled:cursor-not-allowed"
              >
                <ArrowUp className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                aria-label={`Move ${link.platform} link down`}
                onClick={() => onMove(index, "down")}
                disabled={index === totalLinks - 1 || isProcessing}
                className="p-1 text-cloud-dark hover:text-slate-dark disabled:opacity-20 disabled:hover:text-cloud-dark transition-colors rounded cursor-pointer disabled:cursor-not-allowed"
              >
                <ArrowDown className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="p-2 rounded-full bg-ivory-medium border border-stone/70 text-slate-dark shrink-0">
              <PlatformIcon platform={link.platform} className="h-4 w-4" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-gothic text-xs font-bold uppercase tracking-wider text-slate-dark">
                  {link.platform}
                </span>
                <span className="font-gothic text-[10px] uppercase text-cloud-dark bg-ivory-medium px-1.5 py-0.5 rounded">
                  #{index + 1}
                </span>
              </div>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-serif text-xs text-cloud-dark hover:text-slate-dark transition-colors flex items-center gap-1 truncate max-w-[170px] sm:max-w-xs md:max-w-md mt-0.5"
              >
                <span className="truncate">{link.url}</span>
                <ExternalLink className="h-3 w-3 shrink-0 opacity-70" />
              </a>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onStartEdit(link)}
              aria-label={`Edit ${link.platform} link`}
              leftIcon={<Edit2 className="h-3.5 w-3.5" />}
            >
              Edit
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onDelete(link.id)}
              aria-label={`Delete ${link.platform} link`}
              leftIcon={<Trash2 className="h-3.5 w-3.5 text-clay" />}
              className="hover:text-clay hover:bg-clay/10"
            >
              Delete
            </Button>
          </div>
        </div>
      )}
    </li>
  );
};
