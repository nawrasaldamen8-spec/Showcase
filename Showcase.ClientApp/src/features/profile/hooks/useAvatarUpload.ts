import { useCallback, useEffect, useRef, useState } from "react";
import { apiClient } from "@shared/api/apiClient.ts";
import { useAuth } from "@shared/context/useAuth.ts";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ACCEPTED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export interface UseAvatarUploadOptions {
  avatarUrl?: string | null;
  onAvatarUpdated?: (newUrl: string | null) => void;
  onNotify?: (message: string, type?: "success" | "error") => void;
}

function validateAvatarFile(file: File): string | null {
  if (!ACCEPTED_MIME_TYPES.includes(file.type)) {
    return "Invalid file format. Please upload a JPEG, PNG, WebP, or GIF image.";
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return "Image size exceeds 5MB limit. Please choose a smaller file.";
  }
  return null;
}

async function uploadAvatarApi(file: File, objectUrl: string, onProgress: (pct: number) => void): Promise<void> {
  onProgress(35);
  const { uploadUrl, storageKey } = await apiClient.getAvatarUploadUrl({
    contentType: file.type,
    fileSizeBytes: file.size,
  });

  onProgress(65);
  await apiClient.uploadImageFile(uploadUrl, file);

  onProgress(90);
  await apiClient.updateAvatar(storageKey, objectUrl);
}

export function useAvatarUpload({ avatarUrl, onAvatarUpdated, onNotify }: UseAvatarUploadOptions) {
  const { refreshUser } = useAuth();

  const [currentUrl, setCurrentUrl] = useState<string | null>(avatarUrl || null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const createdObjectUrlRef = useRef<string | null>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const safeTimeout = useCallback((fn: () => void, ms: number) => {
    const timer = setTimeout(() => {
      timersRef.current = timersRef.current.filter((t) => t !== timer);
      fn();
    }, ms);
    timersRef.current.push(timer);
    return timer;
  }, []);

  useEffect(() => {
    return () => {
      timersRef.current.forEach((t) => clearTimeout(t));
      timersRef.current = [];
      if (createdObjectUrlRef.current) {
        URL.revokeObjectURL(createdObjectUrlRef.current);
      }
    };
  }, []);

  const handleFileProcess = useCallback(
    async (file: File) => {
      setErrorMessage(null);
      setSuccessMessage(null);

      const valError = validateAvatarFile(file);
      if (valError) {
        setErrorMessage(valError);
        onNotify?.(valError, "error");
        return;
      }

      if (createdObjectUrlRef.current) {
        URL.revokeObjectURL(createdObjectUrlRef.current);
      }
      const objectUrl = URL.createObjectURL(file);
      createdObjectUrlRef.current = objectUrl;

      setCurrentUrl(objectUrl);
      setIsUploading(true);
      setUploadProgress(15);

      try {
        await uploadAvatarApi(file, objectUrl, setUploadProgress);
        await refreshUser();

        setUploadProgress(100);
        setSuccessMessage("Avatar uploaded successfully.");
        onAvatarUpdated?.(objectUrl);
        onNotify?.("Avatar updated successfully.", "success");

        safeTimeout(() => {
          setIsUploading(false);
          setUploadProgress(0);
        }, 600);
        safeTimeout(() => setSuccessMessage(null), 4000);
      } catch (err: unknown) {
        console.error("Avatar upload error:", err);
        setCurrentUrl(avatarUrl || null);
        const problem = err as { detail?: string; title?: string };
        const msg = problem?.detail || problem?.title || "Failed to upload avatar. Please try again.";
        setErrorMessage(msg);
        onNotify?.(msg, "error");
        setIsUploading(false);
        setUploadProgress(0);
      }
    },
    [avatarUrl, onAvatarUpdated, onNotify, refreshUser]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      void handleFileProcess(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
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
      if (createdObjectUrlRef.current) {
        URL.revokeObjectURL(createdObjectUrlRef.current);
        createdObjectUrlRef.current = null;
      }
      setCurrentUrl(null);
      await refreshUser();
      onAvatarUpdated?.(null);
      setSuccessMessage("Avatar removed.");
      onNotify?.("Avatar removed successfully.", "success");

      safeTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: unknown) {
      console.error("Avatar deletion error:", err);
      const problem = err as { detail?: string; title?: string };
      const msg = problem?.detail || problem?.title || "Failed to remove avatar.";
      setErrorMessage(msg);
      onNotify?.(msg, "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const triggerPicker = () => {
    if (!isUploading && !isDeleting) {
      fileInputRef.current?.click();
    }
  };

  return {
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
  };
}
