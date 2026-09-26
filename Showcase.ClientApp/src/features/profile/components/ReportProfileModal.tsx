import React, { useState } from "react";
import { Flag, ShieldAlert } from "lucide-react";
import { Button } from "@shared/components/Button.tsx";
import { Modal } from "@shared/components/Modal.tsx";
import { Textarea } from "@shared/components/Textarea.tsx";
import { useToast } from "@shared/context/index.ts";

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
  { id: "other", label: "Other Concern", desc: "Any other violation of the Showcase platform terms." },
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate submission latency
    setTimeout(() => {
      setIsSubmitting(false);
      showToast("success", `Report for @${username} submitted. Thank you for keeping Showcase safe.`);
      setSelectedReason("impersonation");
      setDetails("");
      onClose();
    }, 600);
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
          <label className="block font-gothic text-xs font-bold uppercase tracking-[0.12em] text-[#141413] mb-2.5">
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
                      ? "bg-[#faf9f5] border-[#d97757] shadow-none"
                      : "bg-[#f0eee6]/40 border-[#cccbc8]/60 hover:bg-[#faf9f5]"
                  }`}
                >
                  <input
                    type="radio"
                    name="reportReason"
                    value={reason.id}
                    checked={isSelected}
                    onChange={() => setSelectedReason(reason.id)}
                    className="mt-0.5 accent-[#d97757] cursor-pointer"
                  />
                  <div className="min-w-0 flex-1">
                    <p className={`font-serif text-sm font-semibold ${isSelected ? "text-[#141413]" : "text-[#141413]/90"}`}>
                      {reason.label}
                    </p>
                    <p className="font-serif text-xs text-[#87867f] mt-0.5">
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
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#faf9f5] border border-[#cccbc8]/60 text-xs font-serif text-[#87867f]">
          <ShieldAlert className="w-4 h-4 text-[#d97757] shrink-0 mt-0.5" />
          <span>
            Reports are confidential. The account owner will not be notified of who submitted the report.
          </span>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-[#cccbc8]/50 flex items-center justify-end gap-3">
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
