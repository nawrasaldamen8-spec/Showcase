import { AlertCircle, Camera, Check, Loader2, Trash2, Upload, User as UserIcon } from "lucide-react";
import React from "react";
import { Button } from "@shared/components/Button.tsx";
import { getOptimizedImageUrl } from "@shared/utils/mediaUrl.ts";
import { useAvatarUpload } from "../hooks/useAvatarUpload.ts";
import { AvatarCropModal } from "./AvatarCropModal.tsx";

export interface AvatarUploaderProps {
  avatarUrl?: string | null;
  name?: string;
  username?: string;
  onAvatarUpdated?: (newUrl: string | null) => void;
}

const ACCEPTED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export const AvatarUploader: React.FC<AvatarUploaderProps> = ({
  avatarUrl,
  name,
  username,
  onAvatarUpdated,
}) => {
  const {
    currentUrl,
    pendingImageSrc,
    isCropModalOpen,
    isDragging,
    isUploading,
    isDeleting,
    uploadProgress,
    errorMessage,
    successMessage,
    fileInputRef,
    handleInputChange,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDelete,
    triggerPicker,
    handleConfirmCrop,
    handleCancelCrop,
  } = useAvatarUpload({ avatarUrl, onAvatarUpdated });

  return (
    <section
      aria-labelledby="avatar-uploader-heading"
      className="bg-ivory-light rounded-card border border-stone/60 p-6 sm:p-8"
    >
      <div className="border-b border-stone/50 pb-5 mb-6">
        <h2
          id="avatar-uploader-heading"
          className="font-gothic text-xl sm:text-2xl font-bold uppercase tracking-tight text-slate-dark"
        >
          Profile Photo
        </h2>
        <p className="font-serif text-sm sm:text-base text-cloud-dark mt-1 leading-relaxed">
          Upload a clear photo representing yourself. Recommended minimum 400x400px.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">
        {/* Circular Avatar Dropzone / Preview */}
        <div className="relative group shrink-0">
          <div
            tabIndex={0}
            role="button"
            aria-label="Upload profile photo"
            onClick={triggerPicker}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                triggerPicker();
              }
            }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative h-28 w-28 sm:h-32 sm:w-32 rounded-full overflow-hidden border-2 cursor-pointer transition-all duration-200 select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-dark ${
              isDragging
                ? "border-clay scale-105 ring-4 ring-clay/20"
                : "border-stone hover:border-slate-dark"
            }`}
          >
            {currentUrl ? (
              <img
                src={getOptimizedImageUrl(currentUrl, "avatar")}
                alt={`${name || username || "User"} avatar`}
                className={`h-full w-full object-cover transition-opacity duration-200 ${
                  isUploading ? "opacity-40" : "group-hover:opacity-85"
                }`}
              />
            ) : (
              <div className="h-full w-full bg-[#F0EEE6] flex items-center justify-center transition-colors group-hover:bg-[#EAE7DC]">
                <UserIcon className="h-12 w-12 sm:h-14 sm:w-14 stroke-[#D97757] fill-none stroke-[1.75]" />
              </div>
            )}

            {!isUploading && !isDeleting && (
              <div className="absolute inset-0 bg-slate-dark/60 text-ivory-light flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150 backdrop-blur-[2px]">
                <Camera className="h-6 w-6 mb-1 text-ivory-light" />
                <span className="font-gothic text-[10px] font-bold uppercase tracking-wider">Change</span>
              </div>
            )}

            {isUploading && (
              <div className="absolute inset-0 bg-slate-dark/70 text-ivory-light flex flex-col items-center justify-center backdrop-blur-sm animate-in fade-in">
                <Loader2 className="h-6 w-6 animate-spin text-clay mb-1" />
                <span className="font-gothic text-[11px] font-bold uppercase tracking-wider">{uploadProgress}%</span>
              </div>
            )}
          </div>
        </div>

        {/* Interactive Controls & File Guidance */}
        <div className="flex-1 space-y-3.5 text-center sm:text-left">
          <div className="space-y-1">
            <h3 className="font-gothic text-sm font-bold uppercase tracking-wider text-slate-dark">
              Profile Photo
            </h3>
            <p className="font-serif text-xs text-cloud-dark">
              Click the avatar or choose a file. JPEG, PNG, WebP, or GIF up to 5MB.
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_MIME_TYPES.join(",")}
            onChange={handleInputChange}
            className="hidden"
            aria-hidden="true"
          />

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1">
            <Button
              type="button"
              variant="slate"
              size="sm"
              onClick={triggerPicker}
              isLoading={isUploading}
              disabled={isDeleting}
              leftIcon={<Upload className="h-3.5 w-3.5" />}
            >
              Upload Photo
            </Button>

            {currentUrl && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDelete}
                isLoading={isDeleting}
                disabled={isUploading}
                leftIcon={<Trash2 className="h-3.5 w-3.5 text-clay" />}
                className="hover:border-clay hover:text-clay"
              >
                Remove Photo
              </Button>
            )}

            {successMessage && (
              <span className="inline-flex items-center gap-1.5 font-gothic text-xs font-semibold uppercase tracking-wider text-[#2e7d32] bg-[#2e7d32]/10 px-3 py-1.5 rounded-full animate-in fade-in">
                <Check className="h-3.5 w-3.5" />
                {successMessage}
              </span>
            )}
          </div>

          {errorMessage && (
            <div
              role="alert"
              className="flex items-center gap-2 p-3 rounded-lg bg-clay/10 border border-clay/40 text-clay text-xs font-serif"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
      </div>

      {/* Large Interactive Avatar Crop & Confirmation Modal */}
      <AvatarCropModal
        isOpen={isCropModalOpen}
        imageSrc={pendingImageSrc}
        onClose={handleCancelCrop}
        onConfirm={handleConfirmCrop}
        isUploading={isUploading}
      />
    </section>
  );
};
