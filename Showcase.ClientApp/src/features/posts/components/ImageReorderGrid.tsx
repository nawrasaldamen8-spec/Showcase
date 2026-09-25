import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { HeroCoverCard } from './HeroCoverCard.tsx';
import { SecondaryPlateCard } from './SecondaryPlateCard.tsx';

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
        <HeroCoverCard
          image={heroImage}
          hasSecondary={secondaryImages.length > 0}
          disabled={disabled}
          isDeleteDisabled={isDeleteDisabledHero}
          onSwapCover={() => handleMoveRight(0)}
          onDelete={() => handleDelete(heroImage.id)}
        />
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

            return (
              <SecondaryPlateCard
                key={image.id}
                image={image}
                realIndex={realIndex}
                isLast={isLast}
                disabled={disabled}
                isDeleteDisabled={isDeleteDisabled}
                onMoveLeft={() => handleMoveLeft(realIndex)}
                onMoveRight={() => handleMoveRight(realIndex)}
                onDelete={() => handleDelete(image.id)}
              />
            );
          })}

          {/* 3. Inline Add Tile */}
          {renderAddTile}
        </div>
      </div>
    </div>
  );
};
