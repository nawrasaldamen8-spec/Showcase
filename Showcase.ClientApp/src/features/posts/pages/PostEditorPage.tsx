import { AlertCircle, ArrowLeft, ExternalLink, Globe, Layers, Save } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiClient } from "../../../shared/api/apiClient.ts";
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

export const PostEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { activePersona, switchPersona } = useAuth();
  const { showToast } = useToast();

  const isEditing = Boolean(id);

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

    // If already editing an existing post, persist reordering to backend/mock layer immediately
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
    // If post is published, invariant requires retaining at least 1 image
    if (postStatus === PostStatus.Published && images.length <= 1) {
      setImageInvariantError(
        "Published works must retain at least one image. Unpublish the post before removing this image.",
      );
      return;
    }

    setImageInvariantError(null);
    setIsDirty(true);

    // If editing existing post on backend, remove from backend
    if (id) {
      try {
        await apiClient.removePostImage(id, imageId);
      } catch (err) {
        console.error("Failed to remove image from storage:", err);
        showToast("error", "Failed to remove image from backend.");
        return;
      }
    }

    // Update local state and renumber displayOrder
    setImages((prev) => {
      const remaining = prev.filter((img) => img.id !== imageId);
      return remaining.map((img, idx) => ({
        ...img,
        displayOrder: idx,
      }));
    });
  };

  // Validate form inputs
  const validateForm = (): boolean => {
    let isValid = true;

    // Title validation
    if (!title.trim()) {
      setTitleError("Title is required.");
      isValid = false;
    } else if (title.trim().length > 120) {
      setTitleError("Title cannot exceed 120 characters.");
      isValid = false;
    } else {
      setTitleError(null);
    }

    // Description validation
    if (!description.trim()) {
      setDescriptionError("Exhibition statement is required.");
      isValid = false;
    } else {
      setDescriptionError(null);
    }

    // Optional External URL validation
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
        isValid = false;
      }
    } else {
      setUrlError(null);
    }

    return isValid;
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
  // Action 1: Save as Draft
  // ---------------------------------------------------------------------------
  const handleSaveDraft = async () => {
    if (!validateForm()) return;

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

        // If currently published and user explicitly saved as draft, unpublish
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

        // Ingest any staged images
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
  // Action 2: Publish Work (STRICT INVARIANT ENFORCEMENT)
  // ---------------------------------------------------------------------------
  const handlePublishWork = async () => {
    if (!validateForm()) return;

    // =========================================================================
    // STRICT BUSINESS INVARIANT:
    // A post CANNOT be published without at least one uploaded image (>= 1).
    // If no images are present, display clear inline error message and prevent publishing.
    // =========================================================================
    if (images.length === 0) {
      setImageInvariantError(
        "Publishing Invariant: A post cannot be published without at least one uploaded plate. Please upload artwork before publishing.",
      );
      // Smooth scroll to dropzone
      window.scrollTo({ top: 350, behavior: "smooth" });
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

        // Ingest any staged images into the new post
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
          <Link to="/explore">
            <Button variant="outline" size="md">
              Return to Explore
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14">
        {/* Navigation & Status Header */}
        <div className="flex items-center justify-between gap-4 pb-6 border-b border-[#cccbc8]">
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
            {isEditing && id && (
              <Link to={`/posts/${id}`} target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="sm" leftIcon={<ExternalLink className="h-3.5 w-3.5" />}>
                  Preview
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Title & Editorial Framing */}
        <div className="py-8 space-y-2">
          <span className="font-gothic text-xs font-bold uppercase tracking-[0.16em] text-[#87867f]">
            {isEditing ? "Editing Catalog Entry" : "New Exhibition Plate"}
          </span>
          <h1 className="font-gothic text-3xl sm:text-4xl lg:text-5xl font-extrabold uppercase tracking-tight text-[#141413]">
            {isEditing ? "Edit Exhibition Work" : "Curate New Work"}
          </h1>
          <p className="font-serif text-base text-[#141413]/70 leading-relaxed">
            Specify artwork metadata, craft an editorial statement in Anthropic Serif, and ingest high-resolution
            photography.
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

        {/* Form Container */}
        <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
          {/* Section 1: Artwork Details */}
          <div className="bg-[#faf9f5] border border-[#cccbc8] rounded-[24px] p-6 sm:p-8 space-y-6">
            <h2 className="font-gothic text-sm font-bold uppercase tracking-[0.14em] text-[#141413] border-b border-[#cccbc8]/60 pb-3">
              1. Exhibition Metadata
            </h2>

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
                helperText="A concise, commanding title displayed prominently across the gallery."
              />
            </div>

            {/* Description Textarea */}
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
                rows={6}
                showCount
                maxLength={2000}
                errorMessage={descriptionError || undefined}
                helperText="Anthropic Serif body copy. Captures the intellectual voice of the exhibition."
              />
            </div>

            {/* External URL Input */}
            <div>
              <Input
                label="External Project Link (Optional)"
                placeholder="https://behance.net/... or https://github.com/..."
                value={externalUrl}
                onChange={(e) => {
                  setExternalUrl(e.target.value);
                  setIsDirty(true);
                  if (urlError) setUrlError(null);
                }}
                leftIcon={<Globe className="h-4 w-4" />}
                errorMessage={urlError || undefined}
                helperText="Link to live site, GitHub repository, Behance project, or publication."
              />
            </div>

            {/* Interactive Tag Management */}
            <div className="space-y-2">
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
                      className="hover:text-[#d97757] focus:outline-none transition-colors cursor-pointer"
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

          {/* Section 2: Image Ingestion & Reordering */}
          <div className="bg-[#faf9f5] border border-[#cccbc8] rounded-[24px] p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#cccbc8]/60 pb-3">
              <h2 className="font-gothic text-sm font-bold uppercase tracking-[0.14em] text-[#141413]">
                2. Exhibition Plates ({images.length} {images.length === 1 ? "Plate" : "Plates"})
              </h2>
              <span className="font-serif text-xs text-[#87867f]">At least 1 plate required for publication</span>
            </div>

            {/* Strict Invariant Error Alert */}
            {imageInvariantError && (
              <div
                role="alert"
                className="flex items-start gap-3 p-4 rounded-xl bg-[#d97757]/10 border border-[#d97757]/40 text-[#d97757] animate-in fade-in"
              >
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <div className="flex-1 font-serif text-xs leading-relaxed">
                  <span className="font-gothic font-bold uppercase tracking-wider block text-[11px] mb-0.5">
                    Publication Invariant Error
                  </span>
                  {imageInvariantError}
                </div>
              </div>
            )}

            {/* Direct-to-R2 Image Dropzone */}
            <ImageDropzone
              postId={id}
              disabled={isSaving || isPublishing}
              onImagesUploaded={handleImagesUploaded}
              onError={(msg) => setImageInvariantError(msg)}
            />

            {/* Image Preview & Reorder Grid */}
            {images.length > 0 && (
              <div className="pt-4 space-y-3">
                <span className="font-gothic text-xs font-semibold uppercase tracking-wider text-[#87867f] block">
                  Curate Plate Order &bull; First Plate Serves as Exhibition Cover
                </span>
                <ImageReorderGrid
                  images={images}
                  onReorder={handleReorderImages}
                  onDelete={handleDeleteImage}
                  isPublished={isCurrentlyPublished}
                  disabled={isSaving || isPublishing}
                />
              </div>
            )}
          </div>

          {/* Action Bar (Pinned Bottom or In-Flow) */}
          <div className="sticky bottom-4 z-30 bg-[#faf9f5]/95 backdrop-blur-md border border-[#cccbc8] rounded-[24px] p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-none">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="md" onClick={handleCancelClick}>
                Cancel
              </Button>
              {isEditing && (
                <span className="text-xs font-serif text-[#87867f] hidden md:inline">
                  Status: {isCurrentlyPublished ? "Published" : "Draft"}
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3 w-full sm:w-auto justify-end">
              {images.length === 0 && (
                <span className="font-serif text-[11px] text-[#87867f] italic">
                  Upload &ge; 1 image to enable publishing
                </span>
              )}

              <div className="flex items-center gap-3">
                {/* Button 1: Save as Draft */}
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

                {/* Button 2: Publish Work */}
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
            </div>
          </div>
        </form>
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
