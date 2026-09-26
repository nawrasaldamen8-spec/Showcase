import React from "react";
import { Button } from "@shared/components/Button.tsx";
import { Modal } from "@shared/components/Modal.tsx";
import type { PostSummaryResponse } from "@shared/types/index.ts";

export interface StudioDeleteModalProps {
  post: PostSummaryResponse | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const StudioDeleteModal: React.FC<StudioDeleteModalProps> = ({
  post,
  isDeleting,
  onClose,
  onConfirm,
}) => {
  return (
    <Modal
      isOpen={post !== null}
      onClose={() => !isDeleting && onClose()}
      title="Delete Project"
      description="This action cannot be undone."
      size="md"
      footer={
        <>
          <Button variant="outline" size="md" disabled={isDeleting} onClick={onClose}>
            Cancel
          </Button>
          <Button variant="clay" size="md" isLoading={isDeleting} onClick={onConfirm}>
            Delete Permanently
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <p className="font-serif text-base text-[#141413]">
          Are you sure you want to permanently delete{" "}
          <strong className="font-gothic font-bold text-[#141413]">&ldquo;{post?.title}&rdquo;</strong>?
        </p>
        <div className="p-3.5 rounded-xl bg-[#d97757]/10 border border-[#d97757]/30 text-xs font-serif text-[#141413]/85 leading-relaxed">
          All associated images and project details will be permanently removed.
        </div>
      </div>
    </Modal>
  );
};
