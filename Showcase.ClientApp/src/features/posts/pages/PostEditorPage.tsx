import React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "@shared/components/Button.tsx";
import { ErrorBanner } from "@shared/components/ErrorBanner.tsx";
import { Modal } from "@shared/components/Modal.tsx";
import { Skeleton } from "@shared/components/Skeleton.tsx";
import { VisitorGuard } from "@shared/components/VisitorGuard.tsx";
import { useAuth } from "@shared/context/index.ts";
import { PostStatus } from "@shared/types/index.ts";
import { WIZARD_STEPS } from "../constants.ts";
import {
  WizardBottomBar,
  WizardStepEditorial,
  WizardStepIdentity,
  WizardStepMedia,
  WizardStepReview,
  WizardStepper,
} from "../components/index.ts";
import { usePostEditor } from "../hooks/usePostEditor.ts";

export const PostEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser, activePersona, switchPersona } = useAuth();

  const editor = usePostEditor(id);

  if (activePersona === "visitor") {
    return (
      <VisitorGuard
        eyebrow="Studio Access"
        title="Creator Mode Required"
        description="Creating and editing projects is reserved for creators. Switch to Creator mode to continue."
        onSwitchPersona={() => switchPersona("creator")}
        secondaryAction={
          <Link to="/studio">
            <Button variant="outline" size="md">
              Return to Studio
            </Button>
          </Link>
        }
      />
    );
  }

  if (editor.isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  const isCurrentlyPublished = editor.postStatus === PostStatus.Published;

  return (
    <div className="min-h-screen bg-[#f0eee6] pb-32">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
        <WizardStepper
          currentStep={editor.currentStep}
          maxReachedStep={editor.maxReachedStep}
          postStatus={editor.postStatus}
          isEditing={editor.isEditing}
          onCancelClick={editor.handleCancelClick}
          onJumpToStep={editor.handleJumpToStep}
        />

        <div className="py-6 sm:py-8 space-y-1.5">
          <span className="font-gothic text-[11px] font-bold uppercase tracking-[0.16em] text-[#d97757]">
            Step {editor.currentStep} of 4 &bull; {WIZARD_STEPS[editor.currentStep - 1].title}
          </span>
          <h1 className="font-gothic text-2xl sm:text-3xl lg:text-4xl font-extrabold uppercase tracking-tight text-[#141413]">
            {editor.currentStep === 1 && "Project Images"}
            {editor.currentStep === 2 && "Project Identity"}
            {editor.currentStep === 3 && "Project Description & Tags"}
            {editor.currentStep === 4 && "Review & Publish"}
          </h1>
          <p className="font-serif text-base text-[#141413]/70 leading-relaxed max-w-2xl">
            {WIZARD_STEPS[editor.currentStep - 1].description}
          </p>
        </div>

        {editor.generalError && (
          <ErrorBanner
            className="mb-8"
            title="Error"
            message={editor.generalError}
          />
        )}

        <div className="space-y-8">
          {editor.currentStep === 1 && (
            <WizardStepMedia
              images={editor.images}
              postId={id}
              imageInvariantError={editor.imageInvariantError}
              setImageInvariantError={editor.setImageInvariantError}
              isSaving={editor.isSaving}
              isPublishing={editor.isPublishing}
              isCurrentlyPublished={isCurrentlyPublished}
              onImagesUploaded={editor.handleImagesUploaded}
              onReorderImages={editor.handleReorderImages}
              onSetCoverImage={editor.handleSetCoverImage}
              onDeleteImage={editor.handleDeleteImage}
            />
          )}

          {editor.currentStep === 2 && (
            <WizardStepIdentity
              title={editor.title}
              setTitle={editor.setTitle}
              titleError={editor.titleError}
              setTitleError={editor.setTitleError}
              externalUrl={editor.externalUrl}
              setExternalUrl={editor.setExternalUrl}
              urlError={editor.urlError}
              setUrlError={editor.setUrlError}
              setIsDirty={editor.setIsDirty}
            />
          )}

          {editor.currentStep === 3 && (
            <WizardStepEditorial
              description={editor.description}
              setDescription={editor.setDescription}
              descriptionError={editor.descriptionError}
              setDescriptionError={editor.setDescriptionError}
              tags={editor.tags}
              tagDraft={editor.tagDraft}
              setTagDraft={editor.setTagDraft}
              onAddTag={editor.handleAddTag}
              onRemoveTag={editor.handleRemoveTag}
              onTagKeyDown={editor.handleTagKeyDown}
              setIsDirty={editor.setIsDirty}
            />
          )}

          {editor.currentStep === 4 && (
            <WizardStepReview
              images={editor.images}
              title={editor.title}
              description={editor.description}
              externalUrl={editor.externalUrl}
              normalizedUrl={editor.getNormalizedUrl()}
              tags={editor.tags}
              currentUser={currentUser}
            />
          )}
        </div>

        <WizardBottomBar
          currentStep={editor.currentStep}
          imagesCount={editor.images.length}
          isSaving={editor.isSaving}
          isPublishing={editor.isPublishing}
          isCurrentlyPublished={isCurrentlyPublished}
          onPrevStep={editor.handlePrevStep}
          onCancelClick={editor.handleCancelClick}
          onNextStep={editor.handleNextStep}
          onSaveDraft={editor.handleSaveDraft}
          onPublishWork={editor.handlePublishWork}
        />
      </div>

      <Modal
        isOpen={editor.showDiscardModal}
        onClose={() => editor.setShowDiscardModal(false)}
        title="Discard Unsaved Changes?"
      >
        <div className="space-y-4">
          <p className="font-serif text-sm text-[#141413]/80 leading-relaxed">
            You have unsaved changes in this project. Are you sure you want to discard them and return to your
            studio?
          </p>
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="ghost" size="sm" onClick={() => editor.setShowDiscardModal(false)}>
              Keep Editing
            </Button>
            <Button
              variant="clay"
              size="sm"
              onClick={() => {
                editor.setShowDiscardModal(false);
                editor.setIsDirty(false);
                navigate(editor.returnUrl);
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
