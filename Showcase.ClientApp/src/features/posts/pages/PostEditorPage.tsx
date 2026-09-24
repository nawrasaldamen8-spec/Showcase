import { AlertCircle, ArrowLeft, ArrowRight, Check, ExternalLink, Globe, Layers, Save } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiClient } from "../../../shared/api/apiClient.ts";
import { Badge } from "../../../shared/components/Badge.tsx";
import { Button } from "../../../shared/components/Button.tsx";
import { Input } from "../../../shared/components/Input.tsx";
import { Modal } from "../../../shared/components/Modal.tsx";
import { Skeleton } from "../../../shared/components/Skeleton.tsx";
import { Textarea } from "../../../shared/components/Textarea.tsx";
import { useAuth, useToast } from "../../../shared/context/index.ts";
import { PostStatus, type PostDetailsResponse } from "../../../shared/types/index.ts";
import { ImageDropzone, type UploadedImageData } from "../components/ImageDropzone.tsx";
import { ImageReorderGrid, type ImageGridItem } from "../components/ImageReorderGrid.tsx";
import { PostStatusBadge } from "../components/PostStatusBadge.tsx";

const SUGGESTED_TAGS = ["UI/UX", "Photography", "Architecture", "Branding", "Engineering", "Editorial"];

type WizardStepNumber = 1 | 2 | 3 | 4;

interface WizardStepMeta {
  step: WizardStepNumber;
  label: string;
  title: string;
  description: string;
}

const WIZARD_STEPS: readonly WizardStepMeta[] = [
  {
    step: 1,
    label: "Media",
    title: "Exhibition Plates",
    description:
      "Upload and arrange high-resolution visual plates. The first plate serves as the primary exhibition cover.",
  },
  {
    step: 2,
    label: "Identity",
    title: "Artwork Identity",
    description: "Define a commanding project title and an optional external live reference or repository link.",
  },
  {
    step: 3,
    label: "Editorial",
    title: "Statement & Tags",
    description:
      "Craft an intellectual exhibition statement in Anthropic Serif, and assign categorical tags for discoverability.",
  },
  {
    step: 4,
    label: "Review",
    title: "Curatorial Review",
    description: "Perform a final curatorial assessment before publishing publicly or securing as a private draft.",
  },
] as const;

export const PostEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser, activePersona, switchPersona } = useAuth();
  const { showToast } = useToast();

  const isEditing = Boolean(id);

  // Stepper State
  const [currentStep, setCurrentStep] = useState<WizardStepNumber>(1);
  const [maxReachedStep, setMaxReachedStep] = useState<WizardStepNumber>(1);

  // Form Fields
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [externalUrl, setExternalUrl] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagDraft, setTagDraft] = useState<string>("");
  const [images, setImages] = useState<ImageGridItem[]>([]);
  const [postStatus, setPostStatus] = useState<number>(PostStatus.Draft);

  // Dirty State & Discard Warning
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [showDiscardModal, setShowDiscardModal] = useState<boolean>(false);

  // Lifecycle States
  const [isLoading, setIsLoading] = useState<boolean>(isEditing);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);

  // Validation & Feedback States
  const [titleError, setTitleError] = useState<string | null>(null);
  const [descriptionError, setDescriptionError] = useState<string | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [imageInvariantError, setImageInvariantError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Prevent accidental browser tab close if there are unsaved modifications
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // Fetch existing post data if in edit mode
  useEffect(() => {
    if (!id) {
      return;
    }

    let isMounted = true;

    async function loadPost() {
      setIsLoading(true);
      setGeneralError(null);
      try {
        const postData: PostDetailsResponse = await apiClient.getPostById(id as string);
        if (!isMounted) return;

        setTitle(postData.title || "");
        setDescription(postData.description || "");
        setExternalUrl(postData.externalUrl || "");
        setTags(postData.tags || []);
        setPostStatus(Number(postData.status));
        setIsDirty(false);

        const mappedImages: ImageGridItem[] = (postData.images || []).map((img, idx) => ({
          id: img.id,
          url: img.url,
          storageKey: img.storageKey,
          displayOrder: img.displayOrder !== undefined ? img.displayOrder : idx,
        }));

        setImages(mappedImages);

        // When editing an existing post, all steps are accessible immediately
        if (mappedImages.length > 0) {
          setMaxReachedStep(4);
        }
      } catch (err) {
        console.error("Failed to load post for editing:", err);
        if (isMounted) {
          setGeneralError("Exhibition plate not found or inaccessible.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadPost();

    return () => {
      isMounted = false;
    };
  }, [id]);

  // Tag helpers
  const handleAddTag = (rawTag: string) => {
    const cleaned = rawTag.trim().replace(/^#/, "");
    if (!cleaned) return;
    if (!tags.includes(cleaned) && tags.length < 10) {
      setTags((prev) => [...prev, cleaned]);
      setIsDirty(true);
    }
    setTagDraft("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((t) => t !== tagToRemove));
    setIsDirty(true);
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddTag(tagDraft);
    } else if (e.key === "Backspace" && !tagDraft && tags.length > 0) {
      handleRemoveTag(tags[tags.length - 1]);
    }
  };

  const handleCancelClick = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (isDirty) {
      setShowDiscardModal(true);
    } else {
      navigate("/studio");
    }
  };

  // Handle images added from Dropzone
  const handleImagesUploaded = (newImages: UploadedImageData[]) => {
    setImageInvariantError(null);
    setIsDirty(true);
    setImages((prev) => {
      const startOrder = prev.length;
      const formatted: ImageGridItem[] = newImages.map((img, index) => ({
        id: img.id || `img_${Date.now()}_${index}`,
        url: img.url,
        storageKey: img.storageKey,
        displayOrder: startOrder + index,
      }));
      return [...prev, ...formatted];
    });
  };

  // Handle image reordering from ImageReorderGrid
  const handleReorderImages = async (reordered: ImageGridItem[]) => {
    setImages(reordered);
    setIsDirty(true);

    if (id) {
      try {
        await apiClient.reorderPostImages(id, {
          items: reordered.map((img) => ({
            id: img.id,
            displayOrder: img.displayOrder,
          })),
        });
      } catch (err) {
        console.error("Failed to synchronize image reorder:", err);
      }
    }
  };

  // Handle image deletion from ImageReorderGrid
  const handleDeleteImage = async (imageId: string) => {
    if (postStatus === PostStatus.Published && images.length <= 1) {
      setImageInvariantError(
        "Published works must retain at least one image. Unpublish the post before removing this image.",
      );
      return;
    }

    setImageInvariantError(null);
    setIsDirty(true);

    if (id) {
      try {
        await apiClient.removePostImage(id, imageId);
      } catch (err) {
        console.error("Failed to remove image from storage:", err);
        showToast("error", "Failed to remove image from backend.");
        return;
      }
    }

    setImages((prev) => {
      const remaining = prev.filter((img) => img.id !== imageId);
      return remaining.map((img, idx) => ({
        ...img,
        displayOrder: idx,
      }));
    });
  };

  // Normalized External URL
  const getNormalizedUrl = (): string | null => {
    if (!externalUrl.trim()) return null;
    let url = externalUrl.trim();
    if (!/^https?:\/\//i.test(url)) {
      url = `https://${url}`;
    }
    return url;
  };

  // ---------------------------------------------------------------------------
  // Step-Specific Validation Rules
  // ---------------------------------------------------------------------------
  const validateStep = (step: WizardStepNumber): boolean => {
    if (step === 1) {
      if (images.length === 0) {
        setImageInvariantError("At least one visual plate is required to proceed.");
        return false;
      }
      setImageInvariantError(null);
      return true;
    }

    if (step === 2) {
      let valid = true;
      if (!title.trim() || title.trim().length < 3) {
        setTitleError("Artwork title is required and must be at least 3 characters.");
        valid = false;
      } else if (title.trim().length > 120) {
        setTitleError("Title cannot exceed 120 characters.");
        valid = false;
      } else {
        setTitleError(null);
      }

      if (externalUrl.trim()) {
        let candidate = externalUrl.trim();
        if (!/^https?:\/\//i.test(candidate)) {
          candidate = `https://${candidate}`;
        }
        try {
          new URL(candidate);
          setUrlError(null);
        } catch {
          setUrlError("Please enter a valid web URL (e.g. https://domain.com).");
          valid = false;
        }
      } else {
        setUrlError(null);
      }

      return valid;
    }

    if (step === 3) {
      if (!description.trim()) {
        setDescriptionError("Exhibition statement is required.");
        return false;
      }
      setDescriptionError(null);
      return true;
    }

    return true;
  };

  // Full form validator before final submission
  const validateFullForm = (): boolean => {
    const s1 = validateStep(1);
    const s2 = validateStep(2);
    const s3 = validateStep(3);

    if (!s1) {
      setCurrentStep(1);
      return false;
    }
    if (!s2) {
      setCurrentStep(2);
      return false;
    }
    if (!s3) {
      setCurrentStep(3);
      return false;
    }

    return true;
  };

  // Stepper Transitions
  const handleNextStep = () => {
    if (!validateStep(currentStep)) return;
    const next = Math.min(4, currentStep + 1) as WizardStepNumber;
    setCurrentStep(next);
    if (next > maxReachedStep) {
      setMaxReachedStep(next);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as WizardStepNumber);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleJumpToStep = (targetStep: WizardStepNumber) => {
    if (targetStep <= maxReachedStep) {
      setCurrentStep(targetStep);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // ---------------------------------------------------------------------------
  // Action 1: Save as Draft
  // ---------------------------------------------------------------------------
  const handleSaveDraft = async () => {
    if (!validateFullForm()) return;

    setIsSaving(true);
    setGeneralError(null);

    try {
      if (id) {
        // Edit existing post
        await apiClient.updatePost(id, {
          title: title.trim(),
          description: description.trim(),
          externalUrl: getNormalizedUrl(),
          tags,
        });

        if (postStatus === PostStatus.Published) {
          await apiClient.unpublishPost(id);
          setPostStatus(PostStatus.Unpublished);
        }

        setIsDirty(false);
        showToast("success", "Draft changes saved successfully.");
        setTimeout(() => {
          navigate("/studio");
        }, 800);
      } else {
        // Create new post as draft
        const created = await apiClient.createPost({
          title: title.trim(),
          description: description.trim(),
          externalUrl: getNormalizedUrl(),
          tags,
        });

        const newPostId = created.id;

        for (const img of images) {
          await apiClient.addPostImage(
            newPostId,
            img.storageKey || `posts/${Date.now()}.jpg`,
            img.url,
            img.displayOrder,
          );
        }

        setIsDirty(false);
        showToast("success", "New exhibition plate saved as Draft.");
        setTimeout(() => {
          navigate("/studio");
        }, 800);
      }
    } catch (err) {
      console.error("Failed to save draft:", err);
      setGeneralError("Failed to save draft. Please check your connection and try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Action 2: Publish Work
  // ---------------------------------------------------------------------------
  const handlePublishWork = async () => {
    if (!validateFullForm()) return;

    if (images.length === 0) {
      setImageInvariantError("A post cannot be published without at least one uploaded plate.");
      setCurrentStep(1);
      return;
    }

    setIsPublishing(true);
    setImageInvariantError(null);
    setGeneralError(null);

    try {
      let targetPostId = id;

      if (!targetPostId) {
        // Create post first
        const created = await apiClient.createPost({
          title: title.trim(),
          description: description.trim(),
          externalUrl: getNormalizedUrl(),
          tags,
        });

        targetPostId = created.id;

        // Ingest staged images
        for (const img of images) {
          await apiClient.addPostImage(
            targetPostId,
            img.storageKey || `posts/${Date.now()}.jpg`,
            img.url,
            img.displayOrder,
          );
        }
      } else {
        // Update existing metadata
        await apiClient.updatePost(targetPostId, {
          title: title.trim(),
          description: description.trim(),
          externalUrl: getNormalizedUrl(),
          tags,
        });
      }

      // Publish post
      await apiClient.publishPost(targetPostId);
      setPostStatus(PostStatus.Published);
      setIsDirty(false);

      showToast("success", "Work successfully published to the exhibition gallery!");
      setTimeout(() => {
        navigate(`/posts/${targetPostId}`);
      }, 900);
    } catch (err) {
      console.error("Failed to publish work:", err);
      const errMsg =
        err instanceof Error ? err.message : "Failed to publish post. Ensure at least one image is uploaded.";
      setGeneralError(errMsg);
    } finally {
      setIsPublishing(false);
    }
  };

  // Guard for Visitor persona
  if (activePersona === "visitor") {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="inline-flex items-center justify-center p-4 rounded-full bg-[#faf9f5] border border-[#cccbc8] text-[#87867f] mb-6">
          <Layers className="h-10 w-10 stroke-[1.5]" />
        </div>
        <span className="font-gothic text-xs font-bold uppercase tracking-[0.16em] text-[#87867f] block mb-2">
          Curator Workspace &bull; Authentication Notice
        </span>
        <h1 className="font-gothic text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-[#141413]">
          Creator Mode Required
        </h1>
        <p className="font-serif text-[18px] text-[#141413]/80 mt-4 leading-relaxed max-w-lg mx-auto">
          Creating and editing exhibition works is reserved for authenticated creators. Switch to the Creator persona to
          compose statements and ingest photography plates.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Button variant="clay" size="md" onClick={() => switchPersona("creator")}>
            Switch to Creator Persona
          </Button>
          <Link to="/studio">
            <Button variant="outline" size="md">
              Return to Studio
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Loading skeleton for edit mode
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  const isCurrentlyPublished = postStatus === PostStatus.Published;

  return (
    <div className="min-h-screen bg-[#f0eee6] pb-32">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
        {/* 1. Minimalist Gallery Stepper Header */}
        <div className="pb-6 border-b border-[#cccbc8]">
          <div className="flex items-center justify-between gap-4 mb-4">
            <button
              type="button"
              onClick={handleCancelClick}
              className="inline-flex items-center gap-2 font-gothic text-xs font-semibold uppercase tracking-[0.10em] text-[#87867f] hover:text-[#141413] transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Return to Studio</span>
            </button>

            <div className="flex items-center gap-3">
              {isEditing && <PostStatusBadge status={postStatus} size="sm" />}
              <span className="font-gothic text-[11px] font-bold uppercase tracking-wider text-[#87867f]">
                Step {currentStep} of 4
              </span>
            </div>
          </div>

          {/* Stepper Tabs Bar */}
          <div className="grid grid-cols-4 gap-2 sm:gap-4 items-center">
            {WIZARD_STEPS.map((s) => {
              const isCurrent = currentStep === s.step;
              const isCompleted = currentStep > s.step;
              const isAccessible = s.step <= maxReachedStep;

              return (
                <button
                  key={s.step}
                  type="button"
                  disabled={!isAccessible}
                  onClick={() => handleJumpToStep(s.step as WizardStepNumber)}
                  className={`group flex flex-col text-left py-1.5 px-1 transition-all ${
                    isAccessible ? "cursor-pointer" : "cursor-not-allowed opacity-40"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`h-5 w-5 rounded-full flex items-center justify-center font-gothic text-[10px] font-bold transition-all shrink-0 ${
                        isCurrent
                          ? "bg-[#141413] text-[#faf9f5]"
                          : isCompleted
                            ? "bg-[#cccbc8] text-[#141413]"
                            : "bg-[#e8e5dc] text-[#87867f]"
                      }`}
                    >
                      {isCompleted ? <Check className="h-3 w-3" /> : s.step}
                    </span>
                    <span
                      className={`font-gothic text-[11px] font-semibold uppercase tracking-[0.12em] truncate transition-colors ${
                        isCurrent
                          ? "text-[#141413]"
                          : isCompleted
                            ? "text-[#141413]/70 group-hover:text-[#141413]"
                            : "text-[#87867f]"
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                  {/* Progress Line Under Step */}
                  <div
                    className={`h-1 w-full rounded-full transition-all duration-300 ${
                      isCurrent ? "bg-[#141413]" : isCompleted ? "bg-[#cccbc8]" : "bg-[#cccbc8]/30"
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Step Framing & Header */}
        <div className="py-6 sm:py-8 space-y-1.5">
          <span className="font-gothic text-[11px] font-bold uppercase tracking-[0.16em] text-[#d97757]">
            Step {currentStep} of 4 &bull; {WIZARD_STEPS[currentStep - 1].title}
          </span>
          <h1 className="font-gothic text-2xl sm:text-3xl lg:text-4xl font-extrabold uppercase tracking-tight text-[#141413]">
            {currentStep === 1 && "Exhibition Plates Ingestion"}
            {currentStep === 2 && "Artwork Identity & Reference"}
            {currentStep === 3 && "Editorial Statement & Tags"}
            {currentStep === 4 && "Curatorial Review & Decision"}
          </h1>
          <p className="font-serif text-base text-[#141413]/70 leading-relaxed max-w-2xl">
            {WIZARD_STEPS[currentStep - 1].description}
          </p>
        </div>

        {/* General Error Banner */}
        {generalError && (
          <div
            role="alert"
            className="mb-8 flex items-start gap-3 p-4 rounded-2xl bg-[#d97757]/10 border border-[#d97757]/30 text-[#d97757]"
          >
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="flex-1 font-serif text-xs leading-relaxed">
              <span className="font-gothic font-bold uppercase tracking-wider block text-[11px] mb-0.5">
                Catalog Error
              </span>
              {generalError}
            </div>
          </div>
        )}

        {/* 3. Step Content (Focused, Unboxed Layout) */}
        <div className="space-y-8">
          {/* ========================================================================= */}
          {/* STEP 1: MEDIA INGESTION                                                    */}
          {/* ========================================================================= */}
          {currentStep === 1 && (
            <div className="space-y-6">
              {/* Image Invariant Warning */}
              {imageInvariantError && (
                <div
                  role="alert"
                  className="flex items-start gap-3 p-4 rounded-xl bg-[#d97757]/10 border border-[#d97757]/40 text-[#d97757] animate-in fade-in"
                >
                  <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                  <div className="flex-1 font-serif text-xs leading-relaxed">
                    <span className="font-gothic font-bold uppercase tracking-wider block text-[11px] mb-0.5">
                      Plate Requirement
                    </span>
                    {imageInvariantError}
                  </div>
                </div>
              )}

              {/* Media Studio: Empty or Populated */}
              {images.length === 0 ? (
                <div className="bg-[#faf9f5] border border-[#cccbc8] rounded-[24px] p-6 sm:p-8 space-y-4">
                  <ImageDropzone
                    variant="full"
                    postId={id}
                    disabled={isSaving || isPublishing}
                    onImagesUploaded={handleImagesUploaded}
                    onError={(msg) => setImageInvariantError(msg)}
                  />
                </div>
              ) : (
                <ImageReorderGrid
                  images={images}
                  onReorder={handleReorderImages}
                  onDelete={handleDeleteImage}
                  isPublished={isCurrentlyPublished}
                  disabled={isSaving || isPublishing}
                  renderAddTile={
                    <ImageDropzone
                      variant="tile"
                      postId={id}
                      disabled={isSaving || isPublishing}
                      onImagesUploaded={handleImagesUploaded}
                      onError={(msg) => setImageInvariantError(msg)}
                    />
                  }
                />
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 2: ARTWORK IDENTITY & REFERENCE                                      */}
          {/* ========================================================================= */}
          {currentStep === 2 && (
            <div className="bg-[#faf9f5] border border-[#cccbc8] rounded-[24px] p-6 sm:p-8 space-y-6">
              {/* Title Input */}
              <div>
                <Input
                  label="Artwork / Project Title *"
                  placeholder="e.g., Brutalist Perspectives: Concrete & Light"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setIsDirty(true);
                    if (titleError) setTitleError(null);
                  }}
                  errorMessage={titleError || undefined}
                  helperText="A concise, commanding title displayed prominently across the gallery (min 3 characters)."
                />
              </div>

              {/* External URL Input */}
              <div>
                <Input
                  label="Live Reference URL (Optional)"
                  placeholder="https://behance.net/... or https://github.com/..."
                  value={externalUrl}
                  onChange={(e) => {
                    setExternalUrl(e.target.value);
                    setIsDirty(true);
                    if (urlError) setUrlError(null);
                  }}
                  leftIcon={<Globe className="h-4 w-4" />}
                  errorMessage={urlError || undefined}
                  helperText="Optional link to live site, GitHub repository, Behance project, or publication."
                />
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 3: EDITORIAL STATEMENT & CATEGORIZATION                              */}
          {/* ========================================================================= */}
          {currentStep === 3 && (
            <div className="bg-[#faf9f5] border border-[#cccbc8] rounded-[24px] p-6 sm:p-8 space-y-6">
              {/* Description Textarea in Anthropic Serif */}
              <div>
                <Textarea
                  label="Exhibition Statement / Description *"
                  placeholder="Articulate the context, architectural vision, photographic techniques, or design philosophy..."
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    setIsDirty(true);
                    if (descriptionError) setDescriptionError(null);
                  }}
                  rows={7}
                  showCount
                  maxLength={2000}
                  errorMessage={descriptionError || undefined}
                  helperText="Anthropic Serif body copy. Captures the intellectual voice of the exhibition."
                />
              </div>

              {/* Interactive Tag Management */}
              <div className="space-y-2 pt-2 border-t border-[#cccbc8]/50">
                <label className="font-gothic text-xs font-semibold uppercase tracking-[0.10em] text-[#141413] flex items-center justify-between">
                  <span>Categorical Tags</span>
                  <span className="text-[#87867f] font-normal lowercase">{tags.length}/10 tags</span>
                </label>
                <div className="min-h-[46px] p-2 bg-[#f0eee6]/60 border border-[#cccbc8] rounded-xl flex flex-wrap items-center gap-1.5 focus-within:border-[#141413] focus-within:bg-[#faf9f5] transition-all">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#141413] text-[#faf9f5] font-gothic text-xs font-medium tracking-wide"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-[#d97757] focus:outline-none transition-colors cursor-pointer leading-none"
                        aria-label={`Remove tag ${tag}`}
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                  {tags.length < 10 && (
                    <input
                      type="text"
                      placeholder={tags.length === 0 ? "Type tag & press Enter or comma..." : "Add another..."}
                      value={tagDraft}
                      onChange={(e) => setTagDraft(e.target.value)}
                      onKeyDown={handleTagKeyDown}
                      onBlur={() => {
                        if (tagDraft.trim()) handleAddTag(tagDraft);
                      }}
                      className="flex-1 min-w-[140px] bg-transparent border-none text-xs font-gothic text-[#141413] placeholder-[#87867f] focus:outline-none px-2 py-1"
                    />
                  )}
                </div>

                {/* Quick suggestions */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="font-gothic text-[11px] text-[#87867f] mr-1">Suggestions:</span>
                  {SUGGESTED_TAGS.map((sug) => {
                    const isSelected = tags.includes(sug);
                    return (
                      <button
                        key={sug}
                        type="button"
                        disabled={isSelected || tags.length >= 10}
                        onClick={() => handleAddTag(sug)}
                        className={`font-gothic text-[11px] px-2.5 py-0.5 rounded-full border transition-all cursor-pointer ${
                          isSelected
                            ? "opacity-40 border-[#cccbc8] bg-transparent text-[#87867f] cursor-default"
                            : "border-[#cccbc8] bg-[#faf9f5] text-[#141413] hover:border-[#141413] hover:bg-[#f0eee6]"
                        }`}
                      >
                        +{sug}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 4: CURATORIAL REVIEW & DECISION                                      */}
          {/* ========================================================================= */}
          {currentStep === 4 && (
            <div className="space-y-6">
              {/* Media Preview Section */}
              {images.length > 0 && (
                <div className="space-y-3">
                  <span className="font-gothic text-xs font-bold uppercase tracking-wider text-[#87867f] block">
                    Visual Presentation &bull; {images.length} {images.length === 1 ? "Plate" : "Plates"}
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                    {/* Primary Hero Plate */}
                    <div className="md:col-span-8 rounded-[20px] overflow-hidden bg-[#e6e3da] border border-[#cccbc8]/60 relative">
                      <img
                        src={images[0].url}
                        alt="Primary exhibition plate preview"
                        className="w-full h-72 sm:h-80 object-cover"
                      />
                      <div className="absolute top-3 left-3 bg-[#141413]/80 backdrop-blur-xs text-[#faf9f5] px-3 py-1 rounded-full font-gothic text-[10px] font-bold uppercase tracking-wider">
                        Primary Cover Plate
                      </div>
                    </div>

                    {/* Secondary Thumbnail Stack */}
                    {images.length > 1 && (
                      <div className="md:col-span-4 grid grid-cols-2 md:grid-cols-1 gap-3 max-h-80 overflow-y-auto pr-1">
                        {images.slice(1).map((img, idx) => (
                          <div
                            key={img.id || idx}
                            className="rounded-xl overflow-hidden bg-[#e6e3da] border border-[#cccbc8]/60 relative h-24 sm:h-28"
                          >
                            <img
                              src={img.url}
                              alt={`Secondary plate ${idx + 2}`}
                              className="w-full h-full object-cover"
                            />
                            <span className="absolute bottom-1.5 right-1.5 bg-[#141413]/70 text-[#faf9f5] px-1.5 py-0.5 rounded text-[9px] font-gothic uppercase">
                              Plate {idx + 2}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Metadata & Statement Review Card */}
              <div className="bg-[#faf9f5] rounded-[24px] border border-[#cccbc8]/60 p-6 sm:p-8 space-y-6">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-gothic text-[11px] font-bold uppercase tracking-wider text-[#87867f]">
                      Artwork Title
                    </span>
                    {currentUser && (
                      <>
                        <span className="text-[#cccbc8]">&bull;</span>
                        <span className="font-gothic text-[11px] text-[#87867f]">
                          By {currentUser.firstName} {currentUser.lastName} (@{currentUser.username})
                        </span>
                      </>
                    )}
                  </div>
                  <h2 className="font-gothic text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-[#141413]">
                    {title || "Untitled Plate"}
                  </h2>
                </div>

                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="stone" size="sm">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="pt-2 border-t border-[#cccbc8]/40">
                  <span className="font-gothic text-[11px] font-bold uppercase tracking-wider text-[#87867f] block mb-2">
                    Exhibition Statement
                  </span>
                  <p className="font-serif text-[16px] sm:text-[17px] text-[#141413]/90 leading-relaxed whitespace-pre-line">
                    {description || "No exhibition statement specified."}
                  </p>
                </div>

                {externalUrl && (
                  <div className="pt-3 border-t border-[#cccbc8]/40 flex items-center gap-2 text-xs font-gothic uppercase tracking-wider text-[#141413]">
                    <Globe className="h-3.5 w-3.5 text-[#87867f]" />
                    <span className="text-[#87867f]">Live Project Reference:</span>
                    <a
                      href={getNormalizedUrl() || externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#d97757] hover:underline flex items-center gap-1 font-semibold truncate"
                    >
                      <span>{externalUrl}</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
              </div>

              {/* Curatorial Decision Guidance Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="p-4 rounded-2xl bg-[#faf9f5]/80 border border-[#cccbc8]/50 space-y-1">
                  <div className="flex items-center gap-2 font-gothic text-xs font-bold uppercase tracking-wider text-[#141413]">
                    <Save className="h-3.5 w-3.5 text-[#87867f]" />
                    <span>Save as Draft</span>
                  </div>
                  <p className="font-serif text-xs text-[#87867f] leading-relaxed">
                    Preserves all artwork plates and metadata safely in your Studio workspace without exposing it to the
                    public feed.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-[#faf9f5]/80 border border-[#cccbc8]/50 space-y-1">
                  <div className="flex items-center gap-2 font-gothic text-xs font-bold uppercase tracking-wider text-[#d97757]">
                    <Globe className="h-3.5 w-3.5 text-[#d97757]" />
                    <span>Publish Work</span>
                  </div>
                  <p className="font-serif text-xs text-[#87867f] leading-relaxed">
                    Immediately renders this exhibition plate in the global curated feed for all community members to
                    experience.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 4. Sticky Wizard Bottom Navigation Bar */}
        <div className="sticky bottom-4 z-30 mt-10 bg-[#faf9f5]/95 backdrop-blur-md border border-[#cccbc8] rounded-[24px] p-4 sm:p-5 flex items-center justify-between gap-4 shadow-none">
          {/* Left Action: Previous or Cancel */}
          <div>
            {currentStep > 1 ? (
              <Button
                variant="outline"
                size="md"
                onClick={handlePrevStep}
                leftIcon={<ArrowLeft className="h-4 w-4" />}
                disabled={isSaving || isPublishing}
              >
                Previous
              </Button>
            ) : (
              <Button variant="ghost" size="md" onClick={handleCancelClick} disabled={isSaving || isPublishing}>
                Cancel
              </Button>
            )}
          </div>

          {/* Right Action: Continue or Final Decisions */}
          <div className="flex items-center gap-3">
            {currentStep < 4 ? (
              <Button
                variant="slate"
                size="md"
                onClick={handleNextStep}
                rightIcon={<ArrowRight className="h-4 w-4" />}
                disabled={isSaving || isPublishing}
              >
                Continue
              </Button>
            ) : (
              <div className="flex items-center gap-3">
                <Button
                  variant="slate"
                  size="md"
                  isLoading={isSaving}
                  disabled={isPublishing}
                  onClick={handleSaveDraft}
                  leftIcon={<Save className="h-4 w-4" />}
                >
                  Save as Draft
                </Button>
                <Button
                  variant="clay"
                  size="md"
                  isLoading={isPublishing}
                  disabled={isSaving || images.length === 0}
                  onClick={handlePublishWork}
                  leftIcon={<Globe className="h-4 w-4" />}
                >
                  {isCurrentlyPublished ? "Update & Publish" : "Publish Work"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Discard Unsaved Changes Modal */}
      <Modal isOpen={showDiscardModal} onClose={() => setShowDiscardModal(false)} title="Discard Unsaved Changes?">
        <div className="space-y-4">
          <p className="font-serif text-sm text-[#141413]/80 leading-relaxed">
            You have unsaved changes in this exhibition plate. Are you sure you want to discard them and return to your
            studio?
          </p>
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setShowDiscardModal(false)}>
              Keep Editing
            </Button>
            <Button
              variant="clay"
              size="sm"
              onClick={() => {
                setShowDiscardModal(false);
                setIsDirty(false);
                navigate("/studio");
              }}
            >
              Discard & Exit
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
