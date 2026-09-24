import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Trash2, AlertTriangle, Image as ImageIcon } from 'lucide-react';

export interface ImageGridItem {
  id: string;
  url: string;
  storageKey?: string;
  displayOrder: number;
}

export interface ImageReorderGridProps {
  images: ImageGridItem[];
  onReorder: (reordered: ImageGridItem[]) => void;
  onDelete: (imageId: string) => void;
  isPublished?: boolean;
  disabled?: boolean;
  className?: string;
  renderAddTile?: React.ReactNode;
}

export const ImageReorderGrid: React.FC<ImageReorderGridProps> = ({
  images,
  onReorder,
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

  // Ensure items are sorted by displayOrder
  const sortedImages = [...images].sort((a, b) => a.displayOrder - b.displayOrder);
  const heroImage = sortedImages[0];
  const secondaryImages = sortedImages.slice(1);

  const handleMoveLeft = (index: number) => {
    if (index <= 0 || disabled) return;
    const updated = [...sortedImages];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;

    // Renumber displayOrder
    const reindexed = updated.map((item, idx) => ({
      ...item,
      displayOrder: idx,
    }));

    onReorder(reindexed);
    setInvariantWarning(null);
  };

  const handleMoveRight = (index: number) => {
    if (index >= sortedImages.length - 1 || disabled) return;
    const updated = [...sortedImages];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;

    // Renumber displayOrder
    const reindexed = updated.map((item, idx) => ({
      ...item,
      displayOrder: idx,
    }));

    onReorder(reindexed);
    setInvariantWarning(null);
  };

  const handleDelete = (imageId: string) => {
    if (disabled) return;

    // MANDATORY BACKEND & FRONTEND INVARIANT:
    // A published post CANNOT remove its final remaining image.
    if (isPublished && sortedImages.length <= 1) {
      setInvariantWarning(
        'Published works must retain at least one image. Unpublish the post or upload a replacement plate before removing this image.'
      );
      return;
    }

    setInvariantWarning(null);
    onDelete(imageId);
  };

  const isDeleteDisabledHero = disabled || (isPublished && sortedImages.length <= 1);

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
              Publishing Invariant Notice
            </span>
            {invariantWarning}
          </div>
        </div>
      )}

      {/* 1. Hero Primary Cover Plate */}
      {heroImage && (
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
                src={heroImage.url}
                alt="Primary Cover Plate"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.01]"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80';
                }}
              />

              {/* Badges on Hero Cover */}
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span className="font-gothic text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full bg-[#141413]/90 text-[#faf9f5] backdrop-blur-md">
                  Plate 01
                </span>
                <span className="font-gothic text-[11px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full bg-[#d97757] text-[#faf9f5] backdrop-blur-md shadow-xs">
                  ★ Primary Cover
                </span>
              </div>

              {/* Action Controls on Hero (Top Right) */}
              <div className="absolute top-4 right-4 flex items-center gap-2">
                {secondaryImages.length > 0 && (
                  <button
                    type="button"
                    onClick={() => handleMoveRight(0)}
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
                  onClick={() => handleDelete(heroImage.id)}
                  disabled={isDeleteDisabledHero}
                  title={
                    isDeleteDisabledHero
                      ? 'Cannot delete the only image from a published post'
                      : 'Remove cover plate'
                  }
                  aria-label="Remove cover plate"
                  className={`p-2 rounded-full backdrop-blur-md transition-colors cursor-pointer select-none ${
                    isDeleteDisabledHero
                      ? 'bg-[#cccbc8]/80 text-[#87867f] cursor-not-allowed opacity-75'
                      : 'bg-[#faf9f5]/90 text-[#141413] hover:bg-[#d97757] hover:text-[#faf9f5]'
                  }`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Sub-bar below Hero Cover */}
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
      )}

      {/* 2. Secondary Plates Grid + Inline Add Tile */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-gothic text-xs font-semibold uppercase tracking-wider text-[#141413]">
              Additional Exhibition Plates ({secondaryImages.length})
            </span>
            <span className="font-serif text-xs text-[#87867f]">
              &bull; Drag or use arrows to rearrange
            </span>
          </div>
          <span className="font-serif text-xs text-[#87867f]">
            Total {sortedImages.length} plates
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {secondaryImages.map((image, idx) => {
            const realIndex = idx + 1; // index in sortedImages
            const isLast = realIndex === sortedImages.length - 1;
            const isDeleteDisabled = disabled || (isPublished && sortedImages.length <= 1);
            const isNextToCover = realIndex === 1;

            return (
              <div
                key={image.id}
                className="group relative flex flex-col bg-[#faf9f5] border border-[#cccbc8] rounded-[20px] overflow-hidden transition-all duration-200 hover:border-[#141413]/60"
              >
                {/* Thumbnail Container */}
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

                  {/* Plate Order Badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="font-gothic text-[11px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-[#141413]/85 text-[#faf9f5] backdrop-blur-xs select-none">
                      Plate {String(realIndex + 1).padStart(2, '0')}
                    </span>
                  </div>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => handleDelete(image.id)}
                    disabled={isDeleteDisabled}
                    title={
                      isDeleteDisabled && isPublished && sortedImages.length <= 1
                        ? 'Cannot delete the only image from a published post'
                        : 'Remove plate'
                    }
                    aria-label={`Remove plate ${realIndex + 1}`}
                    className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-xs transition-colors cursor-pointer select-none ${
                      isDeleteDisabled && isPublished && sortedImages.length <= 1
                        ? 'bg-[#cccbc8]/80 text-[#87867f] cursor-not-allowed opacity-75'
                        : 'bg-[#faf9f5]/90 text-[#141413] hover:bg-[#d97757] hover:text-[#faf9f5]'
                    }`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Bottom Reorder Controls Bar */}
                <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#faf9f5] border-t border-[#cccbc8]/60">
                  <div className="flex items-center gap-1">
                    <ImageIcon className="h-3.5 w-3.5 text-[#87867f]" />
                    <span className="font-gothic text-[11px] uppercase tracking-wider text-[#87867f]">
                      Order #{realIndex + 1}
                    </span>
                  </div>

                  {/* Move Left / Right Arrows */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleMoveLeft(realIndex)}
                      disabled={disabled}
                      title={isNextToCover ? 'Promote to Primary Cover' : 'Move plate left'}
                      aria-label={`Move plate ${realIndex + 1} left`}
                      className="p-1.5 rounded-full border border-[#cccbc8] text-[#141413] transition-colors hover:bg-[#141413] hover:text-[#faf9f5] hover:border-[#141413] cursor-pointer"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleMoveRight(realIndex)}
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
          })}

          {/* 3. Inline Add Tile */}
          {renderAddTile}
        </div>
      </div>
    </div>
  );
};
