import React, { useState } from "react";
import { EyeOff, ShieldAlert } from "lucide-react";
import { Button } from "@shared/components/Button.tsx";
import { Modal } from "@shared/components/Modal.tsx";
import { Textarea } from "@shared/components/Textarea.tsx";
import type { ContentReportItem } from "@shared/types/index.ts";

export interface ReportActionModalProps {
  report: ContentReportItem | null;
  isOpen: boolean;
  onClose: () => void;
  onResolve: (reportId: string, actionTaken: string) => Promise<void>;
  onDismiss: (reportId: string) => Promise<void>;
}

export const ReportActionModal: React.FC<ReportActionModalProps> = ({
  report,
  isOpen,
  onClose,
  onResolve,
  onDismiss,
}) => {
  const [actionNote, setActionNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!report) return null;

  const handleAction = async (resolve: boolean, defaultAction = "") => {
    setIsLoading(true);
    try {
      if (resolve) {
        await onResolve(report.id, actionNote.trim() || defaultAction || "Content moderated per community guidelines.");
      } else {
        await onDismiss(report.id);
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
      title="Content Moderation &amp; Incident Review"
      description={`Report ID: ${report.id} &bull; Type: ${report.targetType.toUpperCase()}`}
      size="lg"
    >
      <div className="space-y-4 pt-2">
        {/* Incident Summary Card */}
        <div className="p-4 rounded-2xl bg-[#f0eee6] border border-[#cccbc8] space-y-2">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 rounded-full bg-red-500/15 text-red-700 font-gothic text-[10px] font-bold uppercase tracking-wider border border-red-500/30">
              {report.reason}
            </span>
            <span className="font-serif text-xs text-[#87867f]">
              Reported by @{report.reporterUsername}
            </span>
          </div>

          <div className="pt-1">
            <h4 className="font-gothic text-sm font-bold uppercase tracking-wider text-[#141413]">
              {report.targetTitle}
            </h4>
            <p className="font-serif text-xs text-[#87867f]">
              Target Account: @{report.targetAuthorUsername}
            </p>
          </div>
        </div>

        {/* Reporter Claim Details */}
        <div className="space-y-1.5">
          <span className="font-gothic text-[11px] font-bold uppercase tracking-wider text-[#87867f] block">
            Report Statement &amp; Evidence
          </span>
          <div className="p-3 rounded-xl bg-[#faf9f5] border border-[#cccbc8] font-serif text-xs text-[#141413] leading-relaxed">
            {report.details}
          </div>
        </div>

        {/* Action Note */}
        <div className="space-y-1.5">
          <label
            htmlFor="report-action-note"
            className="font-gothic text-xs font-bold uppercase tracking-wider text-[#141413] block"
          >
            Resolution Summary / Action Rationale
          </label>
          <Textarea
            id="report-action-note"
            placeholder="e.g. Post removed for copyright infringement or formal warning issued..."
            value={actionNote}
            onChange={(e) => setActionNote(e.target.value)}
            rows={2}
          />
        </div>

        {/* Action Buttons */}
        <div className="pt-3 flex flex-col sm:flex-row justify-between items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={() => handleAction(false)}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            Dismiss Report (No Violation)
          </Button>

          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              type="button"
              variant="slate"
              size="md"
              isLoading={isLoading}
              onClick={() => handleAction(true, "Post taken down for violating copyright guidelines.")}
              leftIcon={<EyeOff className="w-4 h-4" />}
              className="w-full sm:w-auto !bg-red-600 hover:!bg-red-700 !text-white"
            >
              Hide / Remove Content
            </Button>
            <Button
              type="button"
              variant="clay"
              size="md"
              isLoading={isLoading}
              onClick={() => handleAction(true, "Warning issued to creator.")}
              leftIcon={<ShieldAlert className="w-4 h-4" />}
              className="w-full sm:w-auto"
            >
              Issue Warning
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
