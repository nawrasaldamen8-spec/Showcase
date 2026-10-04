import React, { useState } from "react";
import { Flag, ShieldAlert } from "lucide-react";
import { Button } from "@shared/components/Button.tsx";
import { Modal } from "@shared/components/Modal.tsx";
import { Textarea } from "@shared/components/Textarea.tsx";
import { useToast } from "@shared/context/index.ts";

import { apiClient } from "@shared/api/index.ts";

export interface ReportProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  fullName: string;
}

const REPORT_REASONS = [
  { id: "impersonation", label: "Impersonation or Fake Identity", desc: "Pretending to be someone else or using copied branding." },
  { id: "inappropriate", label: "Inappropriate or Offensive Content", desc: "Exhibiting content violating community guidelines." },
  { id: "copyright", label: "Copyright or Intellectual Property Violation", desc: "Displaying artwork or design without proper authorization." },
  { id: "spam", label: "Spam, Commercial Advertising, or Fraud", desc: "Unsolicited promotion, fraudulent activity, or link farming." },
  { id: "harassment", label: "Harassment or Abusive Behavior", desc: "Targeted harassment or hostile behavior." },
  { id: "other", label: "Other Concern", desc: "Any other violation of the Pority platform terms." },
] as const;

export const ReportProfileModal: React.FC<ReportProfileModalProps> = ({
  isOpen,
  onClose,
  username,
  fullName,
}) => {
  const { showToast } = useToast();
  const [selectedReason, setSelectedReason] = useState<string>("impersonation");
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await apiClient.submitReport({
        targetType: "user",
        targetId: username,
        targetLabel: `@${username} (${fullName})`,
        reason: selectedReason,
        details: details.trim() || undefined,
      });

      showToast("success", `Report for @${username} submitted. Thank you for keeping Pority safe.`);
      setSelectedReason("impersonation");
      setDetails("");
      onClose();
    } catch {
      showToast("error", "Failed to submit report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Report Profile"
      description={`Submit a community report for ${fullName} (@${username}). Our moderation team reviews all inquiries.`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-5 pt-2">
        {/* Reasons Radio List */}
        <div>
          <label className="block font-gothic text-xs font-bold uppercase tracking-[0.12em] text-slate-dark mb-2.5">
            Reason for Report
          </label>
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {REPORT_REASONS.map((reason) => {
              const isSelected = selectedReason === reason.id;
              return (
                <label
                  key={reason.id}
                  className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-ivory-light border-clay shadow-none"
                      : "bg-ivory-medium/40 border-stone/60 hover:bg-ivory-light"
                  }`}
                >
                  <input
                    type="radio"
                    name="reportReason"
                    value={reason.id}
                    checked={isSelected}
                    onChange={() => setSelectedReason(reason.id)}
                    className="mt-0.5 accent-clay cursor-pointer"
                  />
                  <div className="min-w-0 flex-1">
                    <p className={`font-serif text-sm font-semibold ${isSelected ? "text-slate-dark" : "text-slate-dark/90"}`}>
                      {reason.label}
                    </p>
                    <p className="font-serif text-xs text-cloud-dark mt-0.5">
                      {reason.desc}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Additional Details */}
        <div>
          <Textarea
            label="Additional Details (Optional)"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Please provide any specific links, context, or evidence that helps us investigate..."
            rows={3}
            maxLength={400}
            showCount={true}
          />
        </div>

        {/* Informational notice */}
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-ivory-light border border-stone/60 text-xs font-serif text-cloud-dark">
          <ShieldAlert className="w-4 h-4 text-clay shrink-0 mt-0.5" />
          <span>
            Reports are confidential. The account owner will not be notified of who submitted the report.
          </span>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-stone/50 flex items-center justify-end gap-3">
          <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="clay"
            size="md"
            isLoading={isSubmitting}
            leftIcon={<Flag className="w-4 h-4" />}
            className="font-gothic text-xs font-bold uppercase tracking-wider"
          >
            Submit Report
          </Button>
        </div>
      </form>
    </Modal>
  );
};
