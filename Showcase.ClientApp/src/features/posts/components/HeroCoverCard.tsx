import React from 'react';
import { ChevronRight, Trash2, Image as ImageIcon } from 'lucide-react';
import type { ImageGridItem } from './ImageReorderGrid.tsx';

export interface HeroCoverCardProps {
  image: ImageGridItem;
  hasSecondary: boolean;
  disabled?: boolean;
  isDeleteDisabled: boolean;
  onSwapCover: () => void;
  onDelete: () => void;
}

export const HeroCoverCard: React.FC<HeroCoverCardProps> = ({
  image,
  hasSecondary,
  disabled = false,
  isDeleteDisabled,
  onSwapCover,
  onDelete,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#d97757]" />
          <span className="font-gothic text-xs font-bold uppercase tracking-wider text-[#141413]">
            Primary Exhibition Cover Plate
          </span>
        </div>
        <span className="font-serif text-xs text-[#87867f]">
          Primary visual across feed & catalog
        </span>
      </div>

      <div className="group relative rounded-[24px] overflow-hidden bg-[#faf9f5] border border-[#cccbc8] transition-all hover:border-[#141413]/60">
        <div className="relative aspect-[16/9] sm:aspect-[2/1] w-full bg-[#e6e3da] overflow-hidden">
          <img
            src={image.url}
            alt="Primary Cover Plate"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.01]"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80';
            }}
          />

          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="font-gothic text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full bg-[#141413]/90 text-[#faf9f5] backdrop-blur-md">
              Plate 01
            </span>
            <span className="font-gothic text-[11px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full bg-[#d97757] text-[#faf9f5] backdrop-blur-md shadow-xs">
              Primary Cover
            </span>
          </div>

          <div className="absolute top-4 right-4 flex items-center gap-2">
            {hasSecondary && (
              <button
                type="button"
                onClick={onSwapCover}
                disabled={disabled}
                title="Swap with Plate 02 (demote from cover)"
                aria-label="Swap cover plate with next plate"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md bg-[#faf9f5]/90 text-[#141413] hover:bg-[#141413] hover:text-[#faf9f5] transition-colors font-gothic text-[11px] font-semibold uppercase tracking-wider cursor-pointer"
              >
                <span>Swap Cover</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            )}

            <button
              type="button"
              onClick={onDelete}
              disabled={isDeleteDisabled}
              title={
                isDeleteDisabled
                  ? 'Cannot delete the only image from a published post'
                  : 'Remove cover plate'
              }
              aria-label="Remove cover plate"
              className={`p-2 rounded-full backdrop-blur-md transition-colors cursor-pointer select-none ${
                isDeleteDisabled
                  ? 'bg-[#cccbc8]/80 text-[#87867f] cursor-not-allowed opacity-75'
                  : 'bg-[#faf9f5]/90 text-[#141413] hover:bg-[#d97757] hover:text-[#faf9f5]'
              }`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between px-5 py-3 bg-[#faf9f5] border-t border-[#cccbc8]/60 text-xs">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-[#87867f]" />
            <span className="font-gothic font-semibold uppercase tracking-wider text-[#141413] text-[11px]">
              Lead Visual Active
            </span>
          </div>
          <span className="font-serif text-[#87867f]">
            To set another plate as cover, promote it from the grid below
          </span>
        </div>
      </div>
    </div>
  );
};
