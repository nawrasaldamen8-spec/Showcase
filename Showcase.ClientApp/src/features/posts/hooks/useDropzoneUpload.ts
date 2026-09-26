import React, { useState, useRef, useCallback } from 'react';
import { apiClient } from '@shared/api/apiClient.ts';

export interface UploadedImageData {
  id?: string;
  storageKey: string;
  url: string;
  file?: File;
}

export interface UseDropzoneUploadOptions {
  postId?: string;
  disabled?: boolean;
  maxSizeBytes?: number;
  allowedTypes?: string[];
  onImagesUploaded?: (newImages: UploadedImageData[]) => void;
  onError?: (error: string) => void;
}

const DEFAULT_MAX_SIZE = 10 * 1024 * 1024; // 10MB
const DEFAULT_ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

async function uploadToR2(
  postId: string,
  file: File,
  onProgress: (percent: number) => void
): Promise<UploadedImageData> {
  const { uploadUrl, storageKey } = await apiClient.getPostImageUploadUrl(postId, {
    contentType: file.type || 'image/jpeg',
    fileSizeBytes: file.size,
  });

  onProgress(50);
  const previewUrl = await apiClient.uploadImageFile(uploadUrl, file);

  onProgress(85);
  const added = await apiClient.addPostImage(postId, storageKey, previewUrl);

  return {
    id: added.imageId,
    storageKey,
    url: previewUrl,
    file,
  };
}

function readFileAsDataUrl(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

async function stageLocalFile(file: File, index: number): Promise<UploadedImageData> {
  const previewUrl = await readFileAsDataUrl(file);
  const ext = file.type.split('/')[1] || 'jpg';
  const storageKey = `posts/staged/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

  await new Promise((resolve) => setTimeout(resolve, 200));

  return {
    id: `local_${Date.now()}_${index}`,
    storageKey,
    url: previewUrl,
    file,
  };
}

export function useDropzoneUpload({
  postId,
  disabled = false,
  maxSizeBytes = DEFAULT_MAX_SIZE,
  allowedTypes = DEFAULT_ALLOWED_TYPES,
  onImagesUploaded,
  onError,
}: UseDropzoneUploadOptions) {
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
        const isTypeAllowed =
          allowedTypes.includes(file.type.toLowerCase()) ||
          /\.(jpe?g|png|webp)$/i.test(file.name);

        if (!isTypeAllowed) {
          return {
            valid: [],
            error: `"${file.name}" is not a supported format. Please upload JPEG, PNG, or WebP images.`,
          };
        }

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

          const result = postId
            ? await uploadToR2(postId, file, (delta) => {
                setUploadProgress({
                  current: i + 1,
                  total: valid.length,
                  percent: progressBase + delta,
                  filename: file.name,
                });
              })
            : await stageLocalFile(file, i);

          uploadedResults.push(result);
        }

        setUploadProgress({
          current: valid.length,
          total: valid.length,
          percent: 100,
          filename: 'Complete',
        });

        setRecentSuccess(
          valid.length === 1
            ? 'Image uploaded successfully.'
            : `${valid.length} images uploaded successfully.`
        );

        onImagesUploaded?.(uploadedResults);
      } catch (err) {
        console.error('Direct upload error:', err);
        const errMsg = err instanceof Error ? err.message : 'Failed to upload image.';
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

  return {
    isDragOver,
    isUploading,
    uploadProgress,
    validationError,
    recentSuccess,
    fileInputRef,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    handleFileInputChange,
    openFilePicker,
  };
}
