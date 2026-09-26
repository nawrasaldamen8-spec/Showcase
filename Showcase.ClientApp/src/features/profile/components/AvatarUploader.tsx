import { AlertCircle, Camera, Check, Loader2, Trash2, Upload, User as UserIcon } from "lucide-react";
import React from "react";
import { Button } from "@shared/components/Button.tsx";
import { useAvatarUpload } from "../hooks/useAvatarUpload.ts";

export interface AvatarUploaderProps {
  avatarUrl?: string | null;
  firstName?: string;
  lastName?: string;
  username?: string;
  onAvatarUpdated?: (newUrl: string | null) => void;
  onNotify?: (message: string, type?: "success" | "error") => void;
}

const ACCEPTED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export const AvatarUploader: React.FC<AvatarUploaderProps> = ({
  avatarUrl,
  firstName,
  lastName,
  username,
  onAvatarUpdated,
  onNotify,
}) => {
  const {
    currentUrl,
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
  } = useAvatarUpload({ avatarUrl, onAvatarUpdated, onNotify });

  const initials = ((firstName?.[0] || "") + (lastName?.[0] || "") || username?.[0] || "A").toUpperCase();

  return (
    <section
      aria-labelledby="avatar-uploader-heading"
      className="bg-[#faf9f5] rounded-[24px] border border-[#cccbc8]/60 p-6 sm:p-8"
    >
      <div className="border-b border-[#cccbc8]/50 pb-5 mb-6">
        <h2
          id="avatar-uploader-heading"
          className="font-gothic text-xl sm:text-2xl font-bold uppercase tracking-tight text-[#141413]"
        >
          Profile Photo
        </h2>
        <p className="font-serif text-sm sm:text-base text-[#87867f] mt-1 leading-relaxed">
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
            className={`relative h-28 w-28 sm:h-32 sm:w-32 rounded-full overflow-hidden border-2 cursor-pointer transition-all duration-200 select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#141413] ${
              isDragging
                ? "border-[#d97757] scale-105 ring-4 ring-[#d97757]/20"
                : "border-[#cccbc8] hover:border-[#141413]"
            }`}
          >
            {currentUrl ? (
              <img
                src={currentUrl}
                alt={`${firstName || username || "User"} avatar`}
                className={`h-full w-full object-cover transition-opacity duration-200 ${
                  isUploading ? "opacity-40" : "group-hover:opacity-85"
                }`}
              />
            ) : (
              <div className="h-full w-full bg-[#141413] text-[#faf9f5] flex items-center justify-center font-gothic text-3xl sm:text-4xl font-extrabold uppercase transition-colors group-hover:bg-[#282725]">
                {initials || <UserIcon className="h-10 w-10 text-[#faf9f5]" />}
              </div>
            )}

            {!isUploading && !isDeleting && (
              <div className="absolute inset-0 bg-[#141413]/60 text-[#faf9f5] flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150 backdrop-blur-[2px]">
                <Camera className="h-6 w-6 mb-1 text-[#faf9f5]" />
                <span className="font-gothic text-[10px] font-bold uppercase tracking-wider">Change</span>
              </div>
            )}

            {isUploading && (
              <div className="absolute inset-0 bg-[#141413]/70 text-[#faf9f5] flex flex-col items-center justify-center backdrop-blur-sm animate-in fade-in">
                <Loader2 className="h-6 w-6 animate-spin text-[#d97757] mb-1" />
                <span className="font-gothic text-[11px] font-bold uppercase tracking-wider">{uploadProgress}%</span>
              </div>
            )}
          </div>
        </div>

        {/* Informational Guidance & Interactive Controls */}
        <div className="flex-1 space-y-4 text-center sm:text-left">
          <div
            onClick={triggerPicker}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border border-dashed rounded-xl p-4 sm:p-5 transition-colors cursor-pointer select-none ${
              isDragging
                ? "border-[#d97757] bg-[#d97757]/5"
                : "border-[#cccbc8] hover:border-[#141413] bg-[#f0eee6]/40 hover:bg-[#f0eee6]/70"
            }`}
          >
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="p-2.5 rounded-full bg-[#faf9f5] border border-[#cccbc8] text-[#87867f]">
                <Upload className="h-5 w-5" />
              </div>
              <div>
                <p className="font-gothic text-xs font-semibold uppercase tracking-wider text-[#141413]">
                  {isDragging ? "Drop Image Here to Upload" : "Click to Upload or Drag and Drop"}
                </p>
                <p className="font-serif text-xs text-[#87867f] mt-0.5">
                  JPEG, PNG, WebP, or GIF up to 5MB.
                </p>
              </div>
            </div>
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
                leftIcon={<Trash2 className="h-3.5 w-3.5 text-[#d97757]" />}
                className="hover:border-[#d97757] hover:text-[#d97757]"
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
              className="flex items-center gap-2 p-3 rounded-lg bg-[#d97757]/10 border border-[#d97757]/40 text-[#d97757] text-xs font-serif"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
