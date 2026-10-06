import React, { useCallback, useEffect, useRef, useState } from "react";
import { extractApiErrorMessage } from "@shared/api/index.ts";
import { useAuth } from "@shared/context/useAuth.ts";
import { useAvatarUploadMutation, useRemoveAvatarMutation } from "./useProfileQueries.ts";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ACCEPTED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export interface UseAvatarUploadOptions {
  avatarUrl?: string | null;
  onAvatarUpdated?: (newUrl: string | null) => void;
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

export function useAvatarUpload({ avatarUrl, onAvatarUpdated }: UseAvatarUploadOptions) {
  const { refreshUser } = useAuth();
  const avatarUploadMutation = useAvatarUploadMutation();
  const removeAvatarMutation = useRemoveAvatarMutation();

  const [currentUrl, setCurrentUrl] = useState<string | null>(avatarUrl || null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const createdObjectUrlRef = useRef<string | null>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const isUploading = avatarUploadMutation.isPending;
  const isDeleting = removeAvatarMutation.isPending;

  useEffect(() => {
    setCurrentUrl(avatarUrl || null);
  }, [avatarUrl]);

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
        return;
      }

      if (createdObjectUrlRef.current) {
        URL.revokeObjectURL(createdObjectUrlRef.current);
      }
      const objectUrl = URL.createObjectURL(file);
      createdObjectUrlRef.current = objectUrl;

      setCurrentUrl(objectUrl);
      setUploadProgress(20);

      try {
        const result = await avatarUploadMutation.mutateAsync(file);
        await refreshUser();

        setUploadProgress(100);
        setSuccessMessage("Avatar uploaded successfully.");
        onAvatarUpdated?.(result.publicUrl);

        safeTimeout(() => {
          setUploadProgress(0);
        }, 600);
        safeTimeout(() => setSuccessMessage(null), 4000);
      } catch (err: unknown) {
        setCurrentUrl(avatarUrl || null);
        const msg = extractApiErrorMessage(err, "Failed to upload avatar. Please try again.");
        setErrorMessage(msg);
        setUploadProgress(0);
      }
    },
    [avatarUrl, avatarUploadMutation, onAvatarUpdated, refreshUser, safeTimeout]
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

    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await removeAvatarMutation.mutateAsync();
      if (createdObjectUrlRef.current) {
        URL.revokeObjectURL(createdObjectUrlRef.current);
        createdObjectUrlRef.current = null;
      }
      setCurrentUrl(null);
      await refreshUser();
      onAvatarUpdated?.(null);
      setSuccessMessage("Avatar removed.");

      safeTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: unknown) {
      const msg = extractApiErrorMessage(err, "Failed to remove avatar.");
      setErrorMessage(msg);
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
