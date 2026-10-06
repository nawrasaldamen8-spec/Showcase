import React, { useState } from "react";
import { Flag, ShieldAlert } from "lucide-react";
import { Button } from "@shared/components/Button.tsx";
import { Modal } from "@shared/components/Modal.tsx";
import { Textarea } from "@shared/components/Textarea.tsx";
import { toast } from "sonner";
import { apiClient } from "@shared/api/index.ts";

export interface ReportPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  postTitle: string;
  creatorUsername?: string;
}

const REPORT_REASONS = [
  { id: "copyright", label: "Copyright / Intellectual Property", desc: "Contains work, architectural drawings, or renders used without permission." },
  { id: "inappropriate", label: "Inappropriate or Offensive Material", desc: "Violates architectural exhibition standards or Pority terms." },
  { id: "misleading", label: "Misleading Information / Fake Work", desc: "Falsely attributes credit or claims authorship of other studios' work." },
  { id: "spam", label: "Spam or Commercial Promotion", desc: "Unsolicited advertising, spam links, or irrelevant content." },
  { id: "other", label: "Other Policy Violation", desc: "Any other violation of platform community rules." },
] as const;

export const ReportPostModal: React.FC<ReportPostModalProps> = ({
  isOpen,
  onClose,
  postId,
  postTitle,
  creatorUsername,
}) => {
  const [selectedReason, setSelectedReason] = useState<string>("copyright");
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const creatorTag = creatorUsername ? ` by @${creatorUsername}` : "";
      await apiClient.submitReport({
        targetType: "post",
        targetId: postId,
        targetLabel: `${postTitle}${creatorTag}`,
        reason: selectedReason,
        details: details.trim() || undefined,
      });

      toast.success("Report submitted for moderation review. Thank you.");
      setSelectedReason("copyright");
      setDetails("");
      onClose();
    } catch {
      toast.error("Failed to submit report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Report Exhibition / Project"
      description={`Reporting: "${postTitle}"${creatorUsername ? ` by @${creatorUsername}` : ""}`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <div className="space-y-2">
          <label className="font-gothic text-xs font-bold uppercase tracking-wider text-slate-dark block">
            Reason for Report <span className="text-clay">*</span>
          </label>
          <div className="space-y-2">
            {REPORT_REASONS.map((r) => (
              <label
                key={r.id}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedReason === r.id
                    ? "border-clay bg-clay/5 ring-1 ring-clay"
                    : "border-stone bg-ivory-light hover:border-cloud-dark"
                }`}
              >
                <input
                  type="radio"
                  name="reportReason"
                  value={r.id}
                  checked={selectedReason === r.id}
                  onChange={() => setSelectedReason(r.id)}
                  className="mt-0.5 accent-clay cursor-pointer"
                />
                <div className="min-w-0 flex-1">
                  <div className="font-gothic font-semibold text-xs text-slate-dark">{r.label}</div>
                  <div className="font-serif text-[11px] text-cloud-dark leading-tight mt-0.5">
                    {r.desc}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="report-post-details"
              className="font-gothic text-xs font-bold uppercase tracking-wider text-slate-dark"
            >
              Additional Details (Optional)
            </label>
            <span className="font-serif text-[11px] text-cloud-dark">{details.length} / 400</span>
          </div>
          <Textarea
            id="report-post-details"
            placeholder="Provide context or evidence regarding the policy violation..."
            value={details}
            onChange={(e) => setDetails(e.target.value.slice(0, 400))}
            rows={2}
            className="bg-ivory-light"
          />
        </div>

        <div className="p-3 rounded-xl bg-ivory-light border border-stone/80 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-cloud-dark shrink-0 mt-0.5" />
          <p className="text-[11px] font-serif text-cloud-dark leading-relaxed">
            Reports are confidential. Platform curators will review this project and issue administrative notices as needed.
          </p>
        </div>

        <div className="pt-2 flex justify-end gap-2.5">
          <Button type="button" variant="outline" size="md" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="clay"
            size="md"
            isLoading={isSubmitting}
            leftIcon={<Flag className="w-4 h-4" />}
          >
            Submit Report
          </Button>
        </div>
      </form>
    </Modal>
  );
};
