import React, { useState } from 'react';
import { AlertTriangle, GripVertical, Star, Trash2 } from 'lucide-react';
import { MAX_POST_IMAGES } from '../constants.ts';

export interface ImageGridItem {
  id: string;
  url: string;
  storageKey?: string;
  displayOrder: number;
  file?: File;
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
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  if (!images || images.length === 0) {
    return null;
  }

  // Ensure items are sorted by displayOrder so index 0 is always the Thumbnail / Cover
  const sortedImages = [...images].sort((a, b) => a.displayOrder - b.displayOrder);

  const handleDragStart = (idx: number) => (e: React.DragEvent) => {
    if (disabled || !onReorder) return;
    setDraggedIdx(idx);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', `${idx}`);
  };

  const handleDragOver = (idx: number) => (e: React.DragEvent) => {
    if (disabled || !onReorder) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIdx !== idx) {
      setDragOverIdx(idx);
    }
  };

  const handleDragLeave = (idx: number) => () => {
    if (dragOverIdx === idx) {
      setDragOverIdx(null);
    }
  };

  const handleDrop = (targetIdx: number) => (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverIdx(null);
    if (disabled || draggedIdx === null || draggedIdx === targetIdx || !onReorder) {
      setDraggedIdx(null);
      return;
    }
    const nextList = [...sortedImages];
    const removed = nextList[draggedIdx];
    if (!removed) {
      setDraggedIdx(null);
      return;
    }
    nextList.splice(draggedIdx, 1);
    nextList.splice(targetIdx, 0, removed);
    const reordered = nextList.map((img, i) => ({ ...img, displayOrder: i }));
    onReorder(reordered);
    setDraggedIdx(null);
  };

  const handleDragEnd = () => {
    setDraggedIdx(null);
    setDragOverIdx(null);
  };

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
          className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber/15 border border-amber/40 text-slate-dark animate-in fade-in"
        >
          <AlertTriangle className="h-5 w-5 text-amber shrink-0 mt-0.5" />
          <div className="flex-1 font-serif text-xs leading-relaxed">
            <span className="font-gothic font-bold uppercase tracking-wider block text-[11px] mb-0.5 text-slate-dark">
              Notice
            </span>
            {invariantWarning}
          </div>
        </div>
      )}

      {/* Grid Header Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-clay" />
          <span className="font-gothic text-xs font-bold uppercase tracking-wider text-slate-dark">
            Project Images ({sortedImages.length}/{MAX_POST_IMAGES})
          </span>
        </div>
        <span className="font-serif text-xs text-cloud-dark hidden sm:inline">
          Drag cards to reorder &bull; First card is thumbnail
        </span>
      </div>

      {/* Unified Plates Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch">
        {sortedImages.map((image, idx) => {
          const isCover = idx === 0;
          const isDeleteDisabled = disabled || (isPublished && sortedImages.length <= 1);
          const isDragging = draggedIdx === idx;
          const isDragOver = dragOverIdx === idx;

          return (
            <div
              key={image.id}
              draggable={!disabled && !!onReorder}
              onDragStart={handleDragStart(idx)}
              onDragOver={handleDragOver(idx)}
              onDragLeave={handleDragLeave(idx)}
              onDrop={handleDrop(idx)}
              onDragEnd={handleDragEnd}
              className={`group relative flex flex-col bg-ivory-light rounded-2xl overflow-hidden border transition-all duration-200 ${
                isDragging
                  ? 'opacity-40 scale-95 border-clay'
                  : isDragOver
                    ? 'border-clay ring-2 ring-clay/40 scale-[1.02]'
                    : isCover
                      ? 'border-slate-dark ring-2 ring-slate-dark/15 shadow-xs'
                      : 'border-stone hover:border-slate-dark/50'
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

                {/* Badge Tag & Drag Handle */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  {onReorder && !disabled && (
                    <div
                      className="p-1 rounded-md bg-slate-dark/75 backdrop-blur-xs text-ivory-light cursor-grab active:cursor-grabbing hover:bg-slate-dark transition-colors"
                      title="Drag to reorder"
                      aria-label="Drag to reorder"
                    >
                      <GripVertical className="h-3.5 w-3.5" />
                    </div>
                  )}

                  {isCover ? (
                    <span className="inline-flex items-center gap-1 font-gothic text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-clay text-ivory-light shadow-xs">
                      <Star className="h-3 w-3 fill-current" />
                      <span>Thumbnail</span>
                    </span>
                  ) : (
                    <span className="font-gothic text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-dark/75 backdrop-blur-xs text-ivory-light">
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
                      ? 'bg-stone/80 text-cloud-dark cursor-not-allowed opacity-75'
                      : 'bg-ivory-light/90 text-slate-dark hover:bg-clay hover:text-ivory-light'
                  }`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Card Footer Actions */}
              <div className="flex items-center justify-between p-3.5 bg-ivory-light border-t border-stone/60 mt-auto">
                {isCover ? (
                  <div className="flex items-center gap-1.5 text-clay font-gothic text-xs font-semibold uppercase tracking-wider">
                    <Star className="h-3.5 w-3.5 fill-current" />
                    <span>Active Thumbnail</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleMakeCover(image.id)}
                    disabled={disabled}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-stone bg-ivory-light text-slate-dark hover:bg-slate-dark hover:text-ivory-light hover:border-slate-dark transition-all font-gothic text-[11px] font-semibold uppercase tracking-wider cursor-pointer active:scale-95"
                  >
                    <Star className="h-3 w-3" />
                    <span>Set as Thumbnail</span>
                  </button>
                )}

                <span className="font-serif text-xs text-cloud-dark font-medium">
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
