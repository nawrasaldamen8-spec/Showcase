import React, { useState, useRef, useCallback } from 'react';
import { UploadCloud, AlertCircle, Loader2, CheckCircle2, Image as ImageIcon, Plus } from 'lucide-react';
import { apiClient } from '../../../shared/api/apiClient.ts';

export interface UploadedImageData {
  id?: string;
  storageKey: string;
  url: string;
  file?: File;
}

export interface ImageDropzoneProps {
  postId?: string;
  disabled?: boolean;
  maxSizeBytes?: number; // default 10MB (10 * 1024 * 1024)
  allowedTypes?: string[]; // default ['image/jpeg', 'image/png', 'image/webp']
  onImagesUploaded?: (newImages: UploadedImageData[]) => void;
  onError?: (error: string) => void;
  className?: string;
  variant?: 'full' | 'tile';
}

const DEFAULT_MAX_SIZE = 10 * 1024 * 1024; // 10MB
const DEFAULT_ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const ImageDropzone: React.FC<ImageDropzoneProps> = ({
  postId,
  disabled = false,
  maxSizeBytes = DEFAULT_MAX_SIZE,
  allowedTypes = DEFAULT_ALLOWED_TYPES,
  onImagesUploaded,
  onError,
  className = '',
  variant = 'full',
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    current: number;
    total: number;
    percent: number;
    filename: string;
  } | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [recentSuccess, setRecentSuccess] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFiles = useCallback(
    (files: File[]): { valid: File[]; error?: string } => {
      for (const file of files) {
        // Validate MIME type
        const isTypeAllowed =
          allowedTypes.includes(file.type.toLowerCase()) ||
          /\.(jpe?g|png|webp)$/i.test(file.name);

        if (!isTypeAllowed) {
          return {
            valid: [],
            error: `"${file.name}" is not a supported format. Please upload JPEG, PNG, or WebP images.`,
          };
        }

        // Validate size
        if (file.size > maxSizeBytes) {
          const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
          const maxMb = (maxSizeBytes / (1024 * 1024)).toFixed(0);
          return {
            valid: [],
            error: `"${file.name}" exceeds the ${maxMb}MB size limit (${sizeMb}MB).`,
          };
        }
      }

      return { valid: files };
    },
    [allowedTypes, maxSizeBytes]
  );

  const processUploads = useCallback(
    async (files: File[]) => {
      if (files.length === 0 || disabled || isUploading) return;

      setValidationError(null);
      setRecentSuccess(null);

      const { valid, error } = validateFiles(files);
      if (error) {
        setValidationError(error);
        onError?.(error);
        return;
      }

      setIsUploading(true);
      const uploadedResults: UploadedImageData[] = [];

      try {
        for (let i = 0; i < valid.length; i++) {
          const file = valid[i];
          const progressBase = Math.round((i / valid.length) * 100);

          setUploadProgress({
            current: i + 1,
            total: valid.length,
            percent: progressBase + 10,
            filename: file.name,
          });

          // 1. Ingest plate via API client simulating Cloudflare R2 presigned upload
          if (postId) {
            // Live/Mock direct R2 upload flow with active post ID
            const { uploadUrl, storageKey } = await apiClient.getPostImageUploadUrl(postId, {
              contentType: file.type || 'image/jpeg',
              fileSizeBytes: file.size,
            });

            setUploadProgress({
              current: i + 1,
              total: valid.length,
              percent: progressBase + 50,
              filename: file.name,
            });

            // Upload directly to storage URL
            const previewUrl = await apiClient.uploadImageFile(uploadUrl, file);

            setUploadProgress({
              current: i + 1,
              total: valid.length,
              percent: progressBase + 85,
              filename: file.name,
            });

            // Register image record in post
            const added = await apiClient.addPostImage(postId, storageKey, previewUrl);

            uploadedResults.push({
              id: added.imageId,
              storageKey,
              url: previewUrl,
              file,
            });
          } else {
            // Local client ingestion staging before post creation
            // Generate direct object preview URL
            const previewUrl = URL.createObjectURL(file);
            const ext = file.type.split('/')[1] || 'jpg';
            const storageKey = `posts/staged/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

            // Simulate realistic Cloudflare R2 network ingestion latency
            await new Promise((resolve) => setTimeout(resolve, 320));

            uploadedResults.push({
              id: `local_${Date.now()}_${i}`,
              storageKey,
              url: previewUrl,
              file,
            });
          }
        }

        setUploadProgress({
          current: valid.length,
          total: valid.length,
          percent: 100,
          filename: 'Complete',
        });

        setRecentSuccess(
          valid.length === 1
            ? 'Plate successfully ingested into storage.'
            : `${valid.length} plates successfully ingested into storage.`
        );

        onImagesUploaded?.(uploadedResults);
      } catch (err) {
        console.error('Direct R2 ingestion error:', err);
        const errMsg = err instanceof Error ? err.message : 'Failed to ingest image to Cloudflare R2.';
        setValidationError(errMsg);
        onError?.(errMsg);
      } finally {
        setIsUploading(false);
        setUploadProgress(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    },
    [postId, disabled, isUploading, validateFiles, onImagesUploaded, onError]
  );

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled || isUploading) return;
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // Only deactivate if leaving the container itself
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragOver(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (disabled || isUploading) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      void processUploads(files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      void processUploads(files);
    }
  };

  const openFilePicker = () => {
    if (disabled || isUploading) return;
    fileInputRef.current?.click();
  };

  if (variant === 'tile') {
    return (
      <div className={`group relative flex flex-col bg-[#faf9f5] border border-[#cccbc8] rounded-[20px] overflow-hidden transition-all duration-200 hover:border-[#141413]/60 ${className}`}>
        <div
          role="button"
          tabIndex={disabled || isUploading ? -1 : 0}
          onClick={openFilePicker}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          aria-label="Add additional artwork plate"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              openFilePicker();
            }
          }}
          className={`relative aspect-[4/3] w-full flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-all duration-200 select-none outline-none border-2 border-dashed ${
            isDragOver
              ? 'border-[#d97757] bg-[#d97757]/10 scale-[1.01]'
              : 'border-[#cccbc8] bg-[#faf9f5]/70 hover:bg-[#faf9f5] hover:border-[#87867f]'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${
            isUploading ? 'cursor-wait pointer-events-none' : ''
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={allowedTypes.join(',')}
            onChange={handleFileInputChange}
            disabled={disabled || isUploading}
            className="hidden"
            aria-hidden="true"
          />

          {isUploading ? (
            <div className="flex flex-col items-center gap-2 animate-in fade-in">
              <Loader2 className="h-6 w-6 text-[#d97757] animate-spin stroke-[2]" />
              <div className="space-y-0.5">
                <span className="font-gothic text-[11px] font-bold uppercase tracking-wider text-[#141413] block">
                  Ingesting...
                </span>
                <span className="font-serif text-[10px] text-[#87867f]">
                  {uploadProgress?.percent || 0}%
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div
                className={`p-3 rounded-full transition-all duration-200 ${
                  isDragOver
                    ? 'bg-[#d97757] text-[#faf9f5]'
                    : 'bg-[#f0eee6] text-[#87867f] group-hover:bg-[#141413] group-hover:text-[#faf9f5]'
                }`}
              >
                <Plus className="h-5 w-5 stroke-[2]" />
              </div>
              <div className="space-y-0.5">
                <p className="font-gothic text-[11px] font-bold uppercase tracking-wider text-[#141413]">
                  {isDragOver ? 'Drop Plate' : 'Add Plate'}
                </p>
                <p className="font-serif text-[10px] text-[#87867f]">
                  Drop or browse
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Card Footer matching sibling plates */}
        <div className="flex items-center justify-center px-3.5 py-2.5 bg-[#faf9f5] border-t border-[#cccbc8]/60 text-[#87867f] font-gothic text-[10px] uppercase tracking-wider">
          <span>+ Ingest Media</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full flex flex-col gap-2 ${className}`}>
      {/* Dropzone Container */}
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFilePicker}
        role="button"
        tabIndex={disabled || isUploading ? -1 : 0}
        aria-label="Upload artwork dropzone"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openFilePicker();
          }
        }}
        className={`relative w-full rounded-[20px] border-2 border-dashed p-8 sm:p-10 transition-all duration-200 cursor-pointer flex flex-col items-center justify-center text-center outline-none select-none ${
          isDragOver
            ? 'border-[#d97757] bg-[#faf9f5] scale-[1.005]'
            : 'border-[#cccbc8] bg-[#faf9f5]/60 hover:bg-[#faf9f5] hover:border-[#87867f]'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${
          isUploading ? 'cursor-wait pointer-events-none' : ''
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={allowedTypes.join(',')}
          onChange={handleFileInputChange}
          disabled={disabled || isUploading}
          className="hidden"
          aria-hidden="true"
        />

        {/* Ingestion in progress */}
        {isUploading ? (
          <div className="flex flex-col items-center gap-3 py-4 max-w-sm w-full animate-in fade-in">
            <div className="relative flex items-center justify-center">
              <Loader2 className="h-10 w-10 text-[#d97757] animate-spin stroke-[1.75]" />
              <ImageIcon className="h-4 w-4 text-[#d97757] absolute" />
            </div>

            <div className="space-y-1 w-full">
              <p className="font-gothic text-[13px] font-bold uppercase tracking-wider text-[#141413]">
                Ingesting to Cloudflare R2...
              </p>
              {uploadProgress && (
                <p className="font-serif text-xs text-[#87867f] truncate">
                  Plate {uploadProgress.current} of {uploadProgress.total}: {uploadProgress.filename}
                </p>
              )}
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-[#cccbc8]/40 rounded-full h-1.5 overflow-hidden mt-1">
              <div
                className="bg-[#d97757] h-full transition-all duration-300 rounded-full"
                style={{ width: `${uploadProgress?.percent || 0}%` }}
              />
            </div>
            <span className="font-gothic text-[10px] font-semibold tracking-widest uppercase text-[#87867f]">
              {uploadProgress?.percent || 0}%
            </span>
          </div>
        ) : (
          /* Idle / Drag State */
          <div className="flex flex-col items-center gap-3">
            <div
              className={`p-4 rounded-full transition-colors ${
                isDragOver
                  ? 'bg-[#d97757]/10 text-[#d97757]'
                  : 'bg-[#f0eee6] text-[#87867f] group-hover:text-[#141413]'
              }`}
            >
              <UploadCloud className="h-8 w-8 stroke-[1.5]" />
            </div>

            <div className="space-y-1">
              <p className="font-gothic text-[14px] font-bold uppercase tracking-wider text-[#141413]">
                {isDragOver ? 'Drop plates to ingest' : 'Drag & drop artwork or click to browse'}
              </p>
              <p className="font-serif text-xs text-[#87867f]">
                Supports JPEG, PNG, and WebP &bull; Max 10MB per plate &bull; Multi-file ingestion supported
              </p>
            </div>

            <div className="mt-2 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-[#cccbc8] bg-[#faf9f5] font-gothic text-[11px] font-semibold uppercase tracking-[0.10em] text-[#141413] hover:border-[#141413] transition-colors">
              <span>Select Plates</span>
            </div>
          </div>
        )}
      </div>

      {/* Validation / Ingestion Error */}
      {validationError && (
        <div
          role="alert"
          className="flex items-center gap-2 p-3 rounded-xl bg-[#d97757]/10 border border-[#d97757]/30 text-[#d97757] font-serif text-xs"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Upload Success Feedback */}
      {recentSuccess && !validationError && !isUploading && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 font-serif text-xs">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{recentSuccess}</span>
        </div>
      )}
    </div>
  );
};
