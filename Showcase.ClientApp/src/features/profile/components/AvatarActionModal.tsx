import { AlertCircle, Camera, Check, Trash2, Upload } from "lucide-react";
import React from "react";
import { Button } from "@shared/components/Button.tsx";
import { Modal } from "@shared/components/Modal.tsx";
import { UserAvatar } from "@shared/components/UserAvatar.tsx";
import { useAvatarUpload } from "../hooks/useAvatarUpload.ts";
import { AvatarCropModal } from "./AvatarCropModal.tsx";

export interface AvatarActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  avatarUrl?: string | null;
  name?: string;
  username?: string;
  onAvatarUpdated?: (newUrl: string | null) => void;
}

const ACCEPTED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export const AvatarActionModal: React.FC<AvatarActionModalProps> = ({
  isOpen,
  onClose,
  avatarUrl,
  name,
  username,
  onAvatarUpdated,
}) => {
  const {
    currentUrl,
    pendingImageSrc,
    isCropModalOpen,
    isUploading,
    isDeleting,
    errorMessage,
    successMessage,
    fileInputRef,
    handleInputChange,
    handleDelete,
    triggerPicker,
    handleConfirmCrop,
    handleCancelCrop,
  } = useAvatarUpload({
    avatarUrl,
    onAvatarUpdated: (newUrl) => {
      onAvatarUpdated?.(newUrl);
      if (!newUrl) {
        onClose();
      }
    },
  });

  const handleUploadSuccessCrop = async (croppedBlob: Blob) => {
    const success = await handleConfirmCrop(croppedBlob);
    if (success) {
      onClose();
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_MIME_TYPES.join(",")}
        onChange={handleInputChange}
        className="hidden"
        aria-hidden="true"
      />

      <Modal
        isOpen={isOpen && !isCropModalOpen}
        onClose={onClose}
        title="Profile Photo"
        description="Choose an action for your profile photo."
        size="sm"
      >
        <div className="space-y-6 pt-2">
          {/* Avatar Preview */}
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="relative">
              <UserAvatar
                src={currentUrl}
                alt={name || username || "User"}
                size="xl"
                className="border-2 border-stone shadow-sm"
              />
              <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-slate-dark text-ivory-light shadow-sm">
                <Camera className="w-4 h-4" />
              </div>
            </div>
            <p className="font-gothic text-xs font-semibold uppercase tracking-wider text-cloud-dark">
              @{username || "profile"}
            </p>
          </div>

          {/* Error / Success Alerts */}
          {errorMessage && (
            <div
              role="alert"
              className="flex items-center gap-2 p-3 rounded-xl bg-clay/10 border border-clay/40 text-clay text-xs font-serif"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="flex items-center justify-center gap-1.5 font-gothic text-xs font-semibold uppercase tracking-wider text-[#2e7d32] bg-[#2e7d32]/10 p-2.5 rounded-xl">
              <Check className="h-3.5 w-3.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-2.5 pt-2 border-t border-stone/50">
            <Button
              type="button"
              variant="clay"
              size="md"
              fullWidth
              onClick={triggerPicker}
              isLoading={isUploading}
              disabled={isDeleting}
              leftIcon={<Upload className="h-4 w-4" />}
              className="justify-center font-gothic font-bold uppercase tracking-wider text-xs"
            >
              Upload New Photo
            </Button>

            {currentUrl && (
              <Button
                type="button"
                variant="outline"
                size="md"
                fullWidth
                onClick={handleDelete}
                isLoading={isDeleting}
                disabled={isUploading}
                leftIcon={<Trash2 className="h-4 w-4 text-clay" />}
                className="justify-center font-gothic font-bold uppercase tracking-wider text-xs hover:border-clay hover:text-clay"
              >
                Remove Current Photo
              </Button>
            )}

            <Button
              type="button"
              variant="ghost"
              size="md"
              fullWidth
              onClick={onClose}
              disabled={isUploading || isDeleting}
              className="justify-center font-gothic font-bold uppercase tracking-wider text-xs text-cloud-dark hover:text-slate-dark"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Interactive Avatar Crop Modal */}
      <AvatarCropModal
        isOpen={isCropModalOpen}
        imageSrc={pendingImageSrc}
        onClose={handleCancelCrop}
        onConfirm={handleUploadSuccessCrop}
        isUploading={isUploading}
      />
    </>
  );
};
