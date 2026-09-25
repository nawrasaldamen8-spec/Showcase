import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "@shared/api/apiClient.ts";
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
  setCurrentStep: (step: WizardStepNumber) => void;
  showToast: (type: "success" | "error", message: string) => void;
}

export function usePostEditorSubmit(options: UsePostEditorSubmitOptions) {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

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
      options.showToast("success", options.id ? "Draft changes saved successfully." : "New exhibition plate saved as Draft.");
      setTimeout(() => navigate("/studio"), 800);
    } catch (err) {
      console.error("Failed to save draft:", err);
      setGeneralError("Failed to save draft. Please check your connection and try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublishWork = async () => {
    if (!options.validateFullForm()) return;
    if (options.images.length === 0) {
      options.setImageInvariantError("A post cannot be published without at least one uploaded plate.");
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
      options.showToast("success", "Work successfully published to the exhibition gallery!");
      setTimeout(() => navigate(`/posts/${targetPostId}`), 900);
    } catch (err) {
      console.error("Failed to publish work:", err);
      const errMsg = err instanceof Error ? err.message : "Failed to publish post. Ensure at least one image is uploaded.";
      setGeneralError(errMsg);
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
