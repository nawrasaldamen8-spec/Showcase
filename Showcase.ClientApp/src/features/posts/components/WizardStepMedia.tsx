import { AlertCircle } from "lucide-react";
import React from "react";
import { ImageDropzone, type UploadedImageData } from "./ImageDropzone.tsx";
import { ImageReorderGrid, type ImageGridItem } from "./ImageReorderGrid.tsx";

export interface WizardStepMediaProps {
  images: ImageGridItem[];
  postId?: string;
  imageInvariantError: string | null;
  setImageInvariantError: (msg: string | null) => void;
  isSaving: boolean;
  isPublishing: boolean;
  isCurrentlyPublished: boolean;
  onImagesUploaded: (newImages: UploadedImageData[]) => void;
  onReorderImages?: (reordered: ImageGridItem[]) => void;
  onSetCoverImage?: (imageId: string) => void;
  onDeleteImage: (imageId: string) => void;
}

export const WizardStepMedia: React.FC<WizardStepMediaProps> = ({
  images,
  postId,
  imageInvariantError,
  setImageInvariantError,
  isSaving,
  isPublishing,
  isCurrentlyPublished,
  onImagesUploaded,
  onReorderImages,
  onSetCoverImage,
  onDeleteImage,
}) => {
  return (
    <div className="space-y-6">
      {imageInvariantError && (
        <div
          role="alert"
          className="flex items-start gap-3 p-4 rounded-xl bg-clay/10 border border-clay/40 text-clay animate-in fade-in"
        >
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div className="flex-1 font-serif text-xs leading-relaxed">
            <span className="font-gothic font-bold uppercase tracking-wider block text-[11px] mb-0.5">
              Image Requirement
            </span>
            {imageInvariantError}
          </div>
        </div>
      )}

      {images.length === 0 ? (
        <div className="bg-ivory-light border border-stone rounded-card p-6 sm:p-8 space-y-4">
          <ImageDropzone
            variant="full"
            postId={postId}
            disabled={isSaving || isPublishing}
            onImagesUploaded={onImagesUploaded}
            onError={(msg) => setImageInvariantError(msg)}
          />
        </div>
      ) : (
        <ImageReorderGrid
          images={images}
          onReorder={onReorderImages}
          onSetCover={onSetCoverImage}
          onDelete={onDeleteImage}
          isPublished={isCurrentlyPublished}
          disabled={isSaving || isPublishing}
          renderAddTile={
            <ImageDropzone
              variant="tile"
              postId={postId}
              disabled={isSaving || isPublishing}
              onImagesUploaded={onImagesUploaded}
              onError={(msg) => setImageInvariantError(msg)}
            />
          }
        />
      )}
    </div>
  );
};
