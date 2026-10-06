import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { apiClient, extractApiErrorMessage, extractApiFieldErrors } from "@shared/api/index.ts";
import { PostStatus } from "@shared/types/index.ts";
import type { ImageGridItem } from "../components/ImageReorderGrid.tsx";
import { persistPostData } from "./postEditorOperations.ts";
import type { WizardStepNumber } from "./usePostEditorSteps.ts";

export interface UsePostEditorSubmitOptions {
  id?: string;
  title: string;
  description: string;
  externalUrl: string;
  getNormalizedUrl: () => string | null;
  tags: string[];
  images: ImageGridItem[];
  postStatus: number;
  setPostStatus: (status: number) => void;
  setIsDirty: (dirty: boolean) => void;
  validateFullForm: () => boolean;
  setImageInvariantError: (err: string | null) => void;
  setTitleError?: (err: string | null) => void;
  setDescriptionError?: (err: string | null) => void;
  setUrlError?: (err: string | null) => void;
  setCurrentStep: (step: WizardStepNumber) => void;
}

export function usePostEditorSubmit(options: UsePostEditorSubmitOptions) {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const navTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (navTimerRef.current) {
        clearTimeout(navTimerRef.current);
      }
    };
  }, []);

  const handleApiErrors = (err: unknown, fallbackMessage: string) => {
    const fieldErrors = extractApiFieldErrors(err);
    let hasFieldErrors = false;

    if (fieldErrors.title && options.setTitleError) {
      options.setTitleError(fieldErrors.title);
      hasFieldErrors = true;
    }
    if (fieldErrors.description && options.setDescriptionError) {
      options.setDescriptionError(fieldErrors.description);
      hasFieldErrors = true;
    }
    if (fieldErrors.externalUrl && options.setUrlError) {
      options.setUrlError(fieldErrors.externalUrl);
      hasFieldErrors = true;
    }

    if (hasFieldErrors) {
      options.setCurrentStep(2);
    }

    const message = extractApiErrorMessage(err, fallbackMessage);
    setGeneralError(message);
    toast.error(message);
  };

  const handleSaveDraft = async () => {
    if (!options.validateFullForm()) return;
    setIsSaving(true);
    setGeneralError(null);
    try {
      await persistPostData({
        id: options.id,
        title: options.title,
        description: options.description,
        externalUrl: options.getNormalizedUrl(),
        tags: options.tags,
        images: options.images,
      });

      if (options.id && options.postStatus === PostStatus.Published) {
        await apiClient.unpublishPost(options.id);
        options.setPostStatus(PostStatus.Unpublished);
      }

      options.setIsDirty(false);
      toast.success("Draft saved successfully.");
      if (navTimerRef.current) {
        clearTimeout(navTimerRef.current);
      }
      navTimerRef.current = setTimeout(() => {
        navTimerRef.current = null;
        navigate("/studio");
      }, 600);
    } catch (err) {
      console.error("Failed to save draft:", err);
      handleApiErrors(err, "Failed to save draft. Please check your connection and try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublishWork = async () => {
    if (!options.validateFullForm()) return;
    if (options.images.length === 0) {
      options.setImageInvariantError("Please upload at least one image to publish.");
      options.setCurrentStep(1);
      return;
    }
    setIsPublishing(true);
    options.setImageInvariantError(null);
    setGeneralError(null);

    try {
      const targetPostId = await persistPostData({
        id: options.id,
        title: options.title,
        description: options.description,
        externalUrl: options.getNormalizedUrl(),
        tags: options.tags,
        images: options.images,
      });

      await apiClient.publishPost(targetPostId);
      options.setPostStatus(PostStatus.Published);
      options.setIsDirty(false);
      toast.success("Project published successfully!");
      if (navTimerRef.current) {
        clearTimeout(navTimerRef.current);
      }
      navTimerRef.current = setTimeout(() => {
        navTimerRef.current = null;
        navigate(`/posts/${targetPostId}`);
      }, 700);
    } catch (err) {
      console.error("Failed to publish work:", err);
      handleApiErrors(err, "Failed to publish post. Ensure at least one image is uploaded.");
    } finally {
      setIsPublishing(false);
    }
  };

  return {
    isSaving,
    isPublishing,
    generalError,
    setGeneralError,
    handleSaveDraft,
    handlePublishWork,
  };
}
