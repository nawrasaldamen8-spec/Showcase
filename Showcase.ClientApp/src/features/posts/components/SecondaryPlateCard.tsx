import React from 'react';
import { ChevronLeft, ChevronRight, Trash2, Image as ImageIcon } from 'lucide-react';
import type { ImageGridItem } from './ImageReorderGrid.tsx';

export interface SecondaryPlateCardProps {
  image: ImageGridItem;
  realIndex: number;
  isLast: boolean;
  disabled?: boolean;
  isDeleteDisabled: boolean;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onDelete: () => void;
}

export const SecondaryPlateCard: React.FC<SecondaryPlateCardProps> = ({
  image,
  realIndex,
  isLast,
  disabled = false,
  isDeleteDisabled,
  onMoveLeft,
  onMoveRight,
  onDelete,
}) => {
  const isNextToCover = realIndex === 1;

  return (
    <div className="group relative flex flex-col bg-[#faf9f5] border border-[#cccbc8] rounded-[20px] overflow-hidden transition-all duration-200 hover:border-[#141413]/60">
      <div className="relative aspect-[4/3] w-full bg-[#f0eee6] overflow-hidden">
        <img
          src={image.url}
          alt={`Plate ${realIndex + 1}`}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80';
          }}
        />

        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span className="font-gothic text-[11px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-[#141413]/85 text-[#faf9f5] backdrop-blur-xs select-none">
            Plate {String(realIndex + 1).padStart(2, '0')}
          </span>
        </div>

        <button
          type="button"
          onClick={onDelete}
          disabled={isDeleteDisabled}
          title={
            isDeleteDisabled
              ? 'Cannot delete the only image from a published post'
              : 'Remove plate'
          }
          aria-label={`Remove plate ${realIndex + 1}`}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-xs transition-colors cursor-pointer select-none ${
            isDeleteDisabled
              ? 'bg-[#cccbc8]/80 text-[#87867f] cursor-not-allowed opacity-75'
              : 'bg-[#faf9f5]/90 text-[#141413] hover:bg-[#d97757] hover:text-[#faf9f5]'
          }`}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#faf9f5] border-t border-[#cccbc8]/60">
        <div className="flex items-center gap-1">
          <ImageIcon className="h-3.5 w-3.5 text-[#87867f]" />
          <span className="font-gothic text-[11px] uppercase tracking-wider text-[#87867f]">
            Order #{realIndex + 1}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onMoveLeft}
            disabled={disabled}
            title={isNextToCover ? 'Promote to Primary Cover' : 'Move plate left'}
            aria-label={`Move plate ${realIndex + 1} left`}
            className="p-1.5 rounded-full border border-[#cccbc8] text-[#141413] transition-colors hover:bg-[#141413] hover:text-[#faf9f5] hover:border-[#141413] cursor-pointer"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={onMoveRight}
            disabled={isLast || disabled}
            title="Move plate right"
            aria-label={`Move plate ${realIndex + 1} right`}
            className={`p-1.5 rounded-full border border-[#cccbc8] text-[#141413] transition-colors ${
              isLast || disabled
                ? 'opacity-30 cursor-not-allowed border-[#cccbc8]/40'
                : 'hover:bg-[#141413] hover:text-[#faf9f5] hover:border-[#141413] cursor-pointer'
            }`}
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
