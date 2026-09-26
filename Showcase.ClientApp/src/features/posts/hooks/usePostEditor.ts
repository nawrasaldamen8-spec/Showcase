import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useToast } from "@shared/context/index.ts";
import { PostStatus } from "@shared/types/index.ts";
import { fetchPostEditorData } from "./postEditorOperations.ts";
import { usePostEditorSubmit } from "./usePostEditorSubmit.ts";
import {
  getNormalizedUrl as normalizeUrlHelper,
  validateFullForm as validateFullFormHelper,
  validateStep as validateStepHelper,
} from "./postEditorValidation.ts";
import { usePostEditorImages } from "./usePostEditorImages.ts";
import { usePostEditorSteps, type WizardStepNumber } from "./usePostEditorSteps.ts";
import { usePostEditorTags } from "./usePostEditorTags.ts";

export type { WizardStepNumber };

export function usePostEditor(id?: string) {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const isEditing = Boolean(id);
  const fromState = location.state as { from?: string } | null;
  const returnUrl = fromState?.from || (id ? `/posts/${id}` : "/studio");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [postStatus, setPostStatus] = useState<number>(PostStatus.Draft);

  const [isDirty, setIsDirty] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditing);

  const [titleError, setTitleError] = useState<string | null>(null);
  const [descriptionError, setDescriptionError] = useState<string | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);

  const {
    tags,
    setTags,
    tagDraft,
    setTagDraft,
    handleAddTag,
    handleRemoveTag,
    handleTagKeyDown,
  } = usePostEditorTags(setIsDirty);

  const {
    images,
    setImages,
    imageInvariantError,
    setImageInvariantError,
    handleImagesUploaded,
    handleReorderImages,
    handleSetCoverImage,
    handleDeleteImage,
  } = usePostEditorImages({
    id,
    postStatus,
    setIsDirty,
    showToast,
  });

  const getNormalizedUrl = () => normalizeUrlHelper(externalUrl);
  const validationState = { imagesCount: images.length, title, externalUrl, description };
  const validationErrors = { setTitleError, setUrlError, setDescriptionError, setImageInvariantError };

  const validateStep = (step: WizardStepNumber): boolean =>
    validateStepHelper(step, validationState, validationErrors);

  const {
    currentStep,
    setCurrentStep,
    maxReachedStep,
    setMaxReachedStep,
    handleNextStep,
    handlePrevStep,
    handleJumpToStep,
  } = usePostEditorSteps(validateStep);

  const validateFullForm = (): boolean =>
    validateFullFormHelper(validationState, validationErrors, setCurrentStep);

  const {
    isSaving,
    isPublishing,
    generalError,
    setGeneralError,
    handleSaveDraft,
    handlePublishWork,
  } = usePostEditorSubmit({
    id,
    title,
    description,
    externalUrl,
    getNormalizedUrl,
    tags,
    images,
    postStatus,
    setPostStatus,
    setIsDirty,
    validateFullForm,
    setImageInvariantError,
    setCurrentStep,
    showToast,
  });

  useEffect(() => {
    if (!isDirty) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    if (!id) return;
    let isMounted = true;

    async function loadPost() {
      setIsLoading(true);
      setGeneralError(null);
      try {
        const data = await fetchPostEditorData(id as string);
        if (!isMounted) return;
        setTitle(data.title);
        setDescription(data.description);
        setExternalUrl(data.externalUrl);
        setTags(data.tags);
        setPostStatus(data.postStatus);
        setIsDirty(false);
        setImages(data.images);
        if (data.images.length > 0) setMaxReachedStep(4);
      } catch (err) {
        console.error("Failed to load post for editing:", err);
        if (isMounted) setGeneralError("Project not found or inaccessible.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void loadPost();
    return () => {
      isMounted = false;
    };
  }, [id, setImages, setMaxReachedStep, setTags, setGeneralError]);

  const handleCancelClick = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (isDirty) setShowDiscardModal(true);
    else navigate(returnUrl);
  };

  return {
    isEditing,
    returnUrl,
    currentStep,
    maxReachedStep,
    title,
    setTitle,
    description,
    setDescription,
    externalUrl,
    setExternalUrl,
    tags,
    tagDraft,
    setTagDraft,
    images,
    postStatus,
    isDirty,
    setIsDirty,
    showDiscardModal,
    setShowDiscardModal,
    isLoading,
    isSaving,
    isPublishing,
    titleError,
    setTitleError,
    descriptionError,
    setDescriptionError,
    urlError,
    setUrlError,
    imageInvariantError,
    setImageInvariantError,
    generalError,
    handleAddTag,
    handleRemoveTag,
    handleTagKeyDown,
    handleCancelClick,
    handleImagesUploaded,
    handleReorderImages,
    handleSetCoverImage,
    handleDeleteImage,
    getNormalizedUrl,
    handleNextStep,
    handlePrevStep,
    handleJumpToStep,
    handleSaveDraft,
    handlePublishWork,
  };
}
