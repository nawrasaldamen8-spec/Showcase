import React, { useState } from 'react';
import { AlertTriangle, Star, Trash2 } from 'lucide-react';

export interface ImageGridItem {
  id: string;
  url: string;
  storageKey?: string;
  displayOrder: number;
}

export interface ImageReorderGridProps {
  images: ImageGridItem[];
  onReorder?: (reordered: ImageGridItem[]) => void;
  onSetCover?: (imageId: string) => void;
  onDelete: (imageId: string) => void;
  isPublished?: boolean;
  disabled?: boolean;
  className?: string;
  renderAddTile?: React.ReactNode;
}

export const ImageReorderGrid: React.FC<ImageReorderGridProps> = ({
  images,
  onReorder,
  onSetCover,
  onDelete,
  isPublished = false,
  disabled = false,
  className = '',
  renderAddTile,
}) => {
  const [invariantWarning, setInvariantWarning] = useState<string | null>(null);

  if (!images || images.length === 0) {
    return null;
  }

  // Ensure items are sorted by displayOrder so index 0 is always the Thumbnail / Cover
  const sortedImages = [...images].sort((a, b) => a.displayOrder - b.displayOrder);

  const handleMakeCover = (imageId: string) => {
    if (disabled) return;
    if (onSetCover) {
      onSetCover(imageId);
      return;
    }

    if (onReorder) {
      const target = sortedImages.find((img) => img.id === imageId);
      if (!target) return;
      const others = sortedImages.filter((img) => img.id !== imageId);
      const reordered = [target, ...others].map((img, idx) => ({ ...img, displayOrder: idx }));
      onReorder(reordered);
    }
  };

  const handleDelete = (imageId: string) => {
    if (disabled) return;

    // MANDATORY BACKEND & FRONTEND INVARIANT:
    // A published post CANNOT remove its final remaining image.
    if (isPublished && sortedImages.length <= 1) {
      setInvariantWarning(
        'Published projects must have at least one image. Upload a replacement image before removing this one.'
      );
      return;
    }

    setInvariantWarning(null);
    onDelete(imageId);
  };

  return (
    <div className={`w-full flex flex-col gap-6 ${className}`}>
      {/* Invariant Warning Banner */}
      {invariantWarning && (
        <div
          role="alert"
          className="flex items-start gap-2.5 p-3.5 rounded-xl bg-[#f1a900]/15 border border-[#f1a900]/40 text-[#141413] animate-in fade-in"
        >
          <AlertTriangle className="h-5 w-5 text-[#f1a900] shrink-0 mt-0.5" />
          <div className="flex-1 font-serif text-xs leading-relaxed">
            <span className="font-gothic font-bold uppercase tracking-wider block text-[11px] mb-0.5 text-[#141413]">
              Notice
            </span>
            {invariantWarning}
          </div>
        </div>
      )}

      {/* Grid Header Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#d97757]" />
          <span className="font-gothic text-xs font-bold uppercase tracking-wider text-[#141413]">
            Project Images ({sortedImages.length})
          </span>
        </div>
        <span className="font-serif text-xs text-[#87867f]">
          Set any image as your cover thumbnail
        </span>
      </div>

      {/* Unified Plates Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch">
        {sortedImages.map((image, idx) => {
          const isCover = idx === 0;
          const isDeleteDisabled = disabled || (isPublished && sortedImages.length <= 1);

          return (
            <div
              key={image.id}
              className={`group relative flex flex-col bg-[#faf9f5] rounded-[22px] overflow-hidden border transition-all duration-200 ${
                isCover
                  ? 'border-[#141413] ring-2 ring-[#141413]/15 shadow-sm'
                  : 'border-[#cccbc8] hover:border-[#141413]/50'
              }`}
            >
              {/* Image Preview Canvas */}
              <div className="relative aspect-[4/3] w-full bg-[#e6e3da] overflow-hidden">
                <img
                  src={image.url}
                  alt={isCover ? 'Cover Image' : `Image ${idx + 1}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80';
                  }}
                />

                {/* Badge Tag */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  {isCover ? (
                    <span className="inline-flex items-center gap-1 font-gothic text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#d97757] text-[#faf9f5] shadow-xs">
                      <Star className="h-3 w-3 fill-current" />
                      <span>Thumbnail Cover</span>
                    </span>
                  ) : (
                    <span className="font-gothic text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#141413]/75 backdrop-blur-xs text-[#faf9f5]">
                      Image {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                    </span>
                  )}
                </div>

                {/* Delete Button */}
                <button
                  type="button"
                  onClick={() => handleDelete(image.id)}
                  disabled={isDeleteDisabled}
                  title={
                    isDeleteDisabled
                      ? 'Cannot delete the only image from a published post'
                      : 'Remove image'
                  }
                  aria-label={`Remove image ${idx + 1}`}
                  className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-xs transition-colors cursor-pointer select-none ${
                    isDeleteDisabled
                      ? 'bg-[#cccbc8]/80 text-[#87867f] cursor-not-allowed opacity-75'
                      : 'bg-[#faf9f5]/90 text-[#141413] hover:bg-[#d97757] hover:text-[#faf9f5]'
                  }`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Card Footer Actions */}
              <div className="flex items-center justify-between p-3.5 bg-[#faf9f5] border-t border-[#cccbc8]/60 mt-auto">
                {isCover ? (
                  <div className="flex items-center gap-1.5 text-[#d97757] font-gothic text-xs font-semibold uppercase tracking-wider">
                    <Star className="h-3.5 w-3.5 fill-current" />
                    <span>Active Thumbnail</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleMakeCover(image.id)}
                    disabled={disabled}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#cccbc8] bg-[#faf9f5] text-[#141413] hover:bg-[#141413] hover:text-[#faf9f5] hover:border-[#141413] transition-all font-gothic text-[11px] font-semibold uppercase tracking-wider cursor-pointer active:scale-95"
                  >
                    <Star className="h-3 w-3" />
                    <span>Set as Thumbnail</span>
                  </button>
                )}

                <span className="font-serif text-xs text-[#87867f]">
                  #{idx + 1}
                </span>
              </div>
            </div>
          );
        })}

        {/* Inline Add Tile */}
        {renderAddTile}
      </div>
    </div>
  );
};
