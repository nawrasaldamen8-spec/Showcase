import React, { useState } from "react";
import { ExternalLink, ShieldCheck, XCircle } from "lucide-react";
import { Button } from "@shared/components/Button.tsx";
import { Modal } from "@shared/components/Modal.tsx";
import { Textarea } from "@shared/components/Textarea.tsx";
import type { VerificationRequestItem } from "@shared/types/index.ts";

export interface VerificationReviewModalProps {
  request: VerificationRequestItem | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (requestId: string, note?: string) => Promise<void>;
  onReject: (requestId: string, note?: string) => Promise<void>;
}

export const VerificationReviewModal: React.FC<VerificationReviewModalProps> = ({
  request,
  isOpen,
  onClose,
  onApprove,
  onReject,
}) => {
  const [decisionNote, setDecisionNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!request) return null;

  const handleDecision = async (approve: boolean) => {
    setIsLoading(true);
    try {
      if (approve) {
        await onApprove(request.id, decisionNote.trim());
      } else {
        await onReject(request.id, decisionNote.trim());
      }
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Review Verification Request"
      description={`Submitted by @${request.username} (${request.fullName})`}
      size="lg"
    >
      <div className="space-y-5 pt-2">
        {/* Creator Info Card */}
        <div className="p-4 rounded-2xl bg-[#f0eee6] border border-[#cccbc8] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {request.avatarUrl ? (
              <img
                src={request.avatarUrl}
                alt={request.fullName}
                className="w-12 h-12 rounded-full object-cover border border-[#cccbc8]"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-[#141413] text-[#faf9f5] flex items-center justify-center font-gothic text-base font-bold">
                {request.fullName[0]}
              </div>
            )}
            <div>
              <h4 className="font-gothic text-sm font-bold uppercase tracking-wider text-[#141413]">
                {request.fullName}
              </h4>
              <p className="font-serif text-xs text-[#87867f]">
                @{request.username} &bull; {request.postsCount} Published Works
              </p>
            </div>
          </div>

          <a
            href={`/u/${request.username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#cccbc8] bg-[#faf9f5] hover:bg-[#e8e5dc] text-[#141413] font-gothic text-[11px] font-bold uppercase tracking-wider transition-colors text-decoration-none"
          >
            <span>View Profile</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Application Message */}
        <div className="space-y-1.5">
          <span className="font-gothic text-[11px] font-bold uppercase tracking-wider text-[#87867f] block">
            Applicant Statement / Context
          </span>
          <div className="p-3.5 rounded-xl bg-[#faf9f5] border border-[#cccbc8] font-serif text-xs text-[#141413] leading-relaxed whitespace-pre-wrap">
            {request.message}
          </div>
        </div>

        {request.notes && (
          <div className="space-y-1.5">
            <span className="font-gothic text-[11px] font-bold uppercase tracking-wider text-[#87867f] block">
              Professional Credentials / External References
            </span>
            <div className="p-3 rounded-xl bg-[#faf9f5] border border-[#cccbc8] font-serif text-xs text-[#141413]/80 leading-relaxed">
              {request.notes}
            </div>
          </div>
        )}

        {/* Decision Note */}
        <div className="space-y-1.5">
          <label
            htmlFor="decision-note"
            className="font-gothic text-xs font-bold uppercase tracking-wider text-[#141413] block"
          >
            Decision Note / Internal Log
          </label>
          <Textarea
            id="decision-note"
            placeholder="e.g. Identity confirmed via national licensing board or editorial portfolio review..."
            value={decisionNote}
            onChange={(e) => setDecisionNote(e.target.value)}
            rows={2}
          />
        </div>

        {/* Actions */}
        <div className="pt-2 flex flex-col sm:flex-row justify-between items-center gap-3">
          <Button type="button" variant="outline" size="md" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>

          <div className="flex gap-2.5 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              size="md"
              isLoading={isLoading}
              onClick={() => handleDecision(false)}
              leftIcon={<XCircle className="w-4 h-4" />}
              className="w-full sm:w-auto text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400"
            >
              Decline Badge
            </Button>
            <Button
              type="button"
              variant="clay"
              size="md"
              isLoading={isLoading}
              onClick={() => handleDecision(true)}
              leftIcon={<ShieldCheck className="w-4 h-4" />}
              className="w-full sm:w-auto"
            >
              Approve &amp; Grant Badge
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
