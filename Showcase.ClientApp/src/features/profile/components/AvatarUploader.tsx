import React, { useState, useRef, useCallback } from 'react';
import { Camera, Trash2, Upload, AlertCircle, Check, Loader2, User as UserIcon } from 'lucide-react';
import { Button } from '../../../shared/components/Button.tsx';
import { apiClient } from '../../../shared/api/apiClient.ts';
import { useAuth } from '../../../shared/context/useAuth.ts';

export interface AvatarUploaderProps {
  avatarUrl?: string | null;
  firstName?: string;
  lastName?: string;
  username?: string;
  onAvatarUpdated?: (newUrl: string | null) => void;
  onNotify?: (message: string, type?: 'success' | 'error') => void;
}

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ACCEPTED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export const AvatarUploader: React.FC<AvatarUploaderProps> = ({
  avatarUrl,
  firstName,
  lastName,
  username,
  onAvatarUpdated,
  onNotify,
}) => {
  const { refreshUser } = useAuth();

  const [currentUrl, setCurrentUrl] = useState<string | null>(avatarUrl || null);
  const [prevAvatarUrl, setPrevAvatarUrl] = useState(avatarUrl);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (avatarUrl !== prevAvatarUrl) {
    setPrevAvatarUrl(avatarUrl);
    setCurrentUrl(avatarUrl || null);
  }

  const initials = (
    (firstName?.[0] || '') + (lastName?.[0] || '') ||
    username?.[0] ||
    'A'
  ).toUpperCase();

  const handleFileProcess = useCallback(async (file: File) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validate type
    if (!ACCEPTED_MIME_TYPES.includes(file.type)) {
      setErrorMessage('Invalid file format. Please upload a JPEG, PNG, WebP, or GIF image.');
      onNotify?.('Invalid file format. Supported: JPG, PNG, WebP, GIF.', 'error');
      return;
    }

    // Validate size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrorMessage('Image size exceeds 5MB limit. Please choose a smaller file.');
      onNotify?.('Image file exceeds the 5MB maximum limit.', 'error');
      return;
    }

    // Create instant local preview
    const objectUrl = URL.createObjectURL(file);
    setCurrentUrl(objectUrl);
    setIsUploading(true);
    setUploadProgress(15);

    try {
      // 1. Get presigned upload URL simulation
      setUploadProgress(35);
      const { uploadUrl, storageKey } = await apiClient.getAvatarUploadUrl({
        contentType: file.type,
        fileSizeBytes: file.size,
      });

      // 2. Direct binary upload simulation
      setUploadProgress(65);
      await apiClient.uploadImageFile(uploadUrl, file);

      // 3. Finalize avatar update in backend / state
      setUploadProgress(90);
      await apiClient.updateAvatar(storageKey, objectUrl);

      // 4. Synchronize user context
      await refreshUser();

      setUploadProgress(100);
      setSuccessMessage('Avatar uploaded successfully.');
      onAvatarUpdated?.(objectUrl);
      onNotify?.('Avatar updated successfully.', 'success');

      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 600);

      setTimeout(() => {
        setSuccessMessage(null);
      }, 4000);
    } catch (err: unknown) {
      console.error('Avatar upload error:', err);
      // Revert preview on failure
      setCurrentUrl(avatarUrl || null);
      const problem = err as { detail?: string; title?: string };
      const msg = problem?.detail || problem?.title || 'Failed to upload avatar. Please try again.';
      setErrorMessage(msg);
      onNotify?.(msg, 'error');
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [avatarUrl, onAvatarUpdated, onNotify, refreshUser]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      void handleFileProcess(file);
    }
    // Reset file input value so same file can be selected again if desired
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isUploading && !isDeleting) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (isUploading || isDeleting) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      void handleFileProcess(file);
    }
  };

  const handleDelete = async () => {
    if (!currentUrl || isDeleting || isUploading) return;

    setIsDeleting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await apiClient.removeAvatar();
      setCurrentUrl(null);
      await refreshUser();
      onAvatarUpdated?.(null);
      setSuccessMessage('Avatar removed.');
      onNotify?.('Avatar removed successfully.', 'success');

      setTimeout(() => {
        setSuccessMessage(null);
      }, 4000);
    } catch (err: unknown) {
      console.error('Avatar deletion error:', err);
      const problem = err as { detail?: string; title?: string };
      const msg = problem?.detail || problem?.title || 'Failed to remove avatar.';
      setErrorMessage(msg);
      onNotify?.(msg, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const triggerPicker = () => {
    if (!isUploading && !isDeleting) {
      fileInputRef.current?.click();
    }
  };

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
          Exhibition Avatar
        </h2>
        <p className="font-serif text-sm sm:text-base text-[#87867f] mt-1 leading-relaxed">
          High-resolution artist portrait representing your showcase identity. Recommended minimum 400×400px.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">
        {/* Circular Avatar Dropzone / Preview */}
        <div className="relative group shrink-0">
          <div
            tabIndex={0}
            role="button"
            aria-label="Upload new avatar image"
            onClick={triggerPicker}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                triggerPicker();
              }
            }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative h-28 w-28 sm:h-32 sm:w-32 rounded-full overflow-hidden border-2 cursor-pointer transition-all duration-200 select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#141413] ${
              isDragging
                ? 'border-[#d97757] scale-105 ring-4 ring-[#d97757]/20'
                : 'border-[#cccbc8] hover:border-[#141413]'
            }`}
          >
            {/* Avatar Image or Monogram */}
            {currentUrl ? (
              <img
                src={currentUrl}
                alt={`${firstName || username || 'Creator'} avatar`}
                className={`h-full w-full object-cover transition-opacity duration-200 ${
                  isUploading ? 'opacity-40' : 'group-hover:opacity-85'
                }`}
              />
            ) : (
              <div className="h-full w-full bg-[#141413] text-[#faf9f5] flex items-center justify-center font-gothic text-3xl sm:text-4xl font-extrabold uppercase transition-colors group-hover:bg-[#282725]">
                {initials || <UserIcon className="h-10 w-10 text-[#faf9f5]" />}
              </div>
            )}

            {/* Hover Action Overlay */}
            {!isUploading && !isDeleting && (
              <div className="absolute inset-0 bg-[#141413]/60 text-[#faf9f5] flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150 backdrop-blur-[2px]">
                <Camera className="h-6 w-6 mb-1 text-[#faf9f5]" />
                <span className="font-gothic text-[10px] font-bold uppercase tracking-wider">
                  Change
                </span>
              </div>
            )}

            {/* Uploading Circular Progress Overlay */}
            {isUploading && (
              <div className="absolute inset-0 bg-[#141413]/70 text-[#faf9f5] flex flex-col items-center justify-center backdrop-blur-sm animate-in fade-in">
                <Loader2 className="h-6 w-6 animate-spin text-[#d97757] mb-1" />
                <span className="font-gothic text-[11px] font-bold uppercase tracking-wider">
                  {uploadProgress}%
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Informational Guidance & Interactive Controls */}
        <div className="flex-1 space-y-4 text-center sm:text-left">
          {/* Drag & Drop Area Box */}
          <div
            onClick={triggerPicker}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border border-dashed rounded-xl p-4 sm:p-5 transition-colors cursor-pointer select-none ${
              isDragging
                ? 'border-[#d97757] bg-[#d97757]/5'
                : 'border-[#cccbc8] hover:border-[#141413] bg-[#f0eee6]/40 hover:bg-[#f0eee6]/70'
            }`}
          >
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="p-2.5 rounded-full bg-[#faf9f5] border border-[#cccbc8] text-[#87867f]">
                <Upload className="h-5 w-5" />
              </div>
              <div>
                <p className="font-gothic text-xs font-semibold uppercase tracking-wider text-[#141413]">
                  {isDragging ? 'Drop Image Here to Upload' : 'Click to Upload or Drag and Drop'}
                </p>
                <p className="font-serif text-xs text-[#87867f] mt-0.5">
                  JPEG, PNG, WebP, or GIF up to 5MB. Cloudflare R2 storage simulated.
                </p>
              </div>
            </div>
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_MIME_TYPES.join(',')}
            onChange={handleInputChange}
            className="hidden"
            aria-hidden="true"
          />

          {/* Buttons & Status Indicators */}
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
              Upload New Photo
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
                Remove Avatar
              </Button>
            )}

            {successMessage && (
              <span className="inline-flex items-center gap-1.5 font-gothic text-xs font-semibold uppercase tracking-wider text-[#2e7d32] bg-[#2e7d32]/10 px-3 py-1.5 rounded-full animate-in fade-in">
                <Check className="h-3.5 w-3.5" />
                {successMessage}
              </span>
            )}
          </div>

          {/* Error Message */}
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
