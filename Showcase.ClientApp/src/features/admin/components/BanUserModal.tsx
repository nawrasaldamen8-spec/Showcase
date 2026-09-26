import React, { useState } from "react";
import { AlertTriangle, ShieldCheck } from "lucide-react";
import { Button } from "@shared/components/Button.tsx";
import { Modal } from "@shared/components/Modal.tsx";
import { Textarea } from "@shared/components/Textarea.tsx";
import type { AdminUserListItem } from "@shared/types/index.ts";

export interface BanUserModalProps {
  user: AdminUserListItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmBan: (userId: string, reason: string) => Promise<void>;
  onConfirmUnban: (userId: string) => Promise<void>;
}

export const BanUserModal: React.FC<BanUserModalProps> = ({
  user,
  isOpen,
  onClose,
  onConfirmBan,
  onConfirmUnban,
}) => {
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!user) return null;

  const isBanned = user.status === "suspended";

  const handleAction = async () => {
    setIsLoading(true);
    try {
      if (isBanned) {
        await onConfirmUnban(user.id);
      } else {
        await onConfirmBan(user.id, reason.trim());
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
      title={isBanned ? "Reinstate Account" : "Suspend / Ban User Account"}
      description={`Target creator: @${user.username} (${user.firstName} ${user.lastName})`}
      size="md"
    >
      <div className="space-y-4 pt-2">
        {isBanned ? (
          <div className="p-4 rounded-xl bg-[#2e7d32]/10 border border-[#2e7d32]/30 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-[#2e7d32] shrink-0 mt-0.5" />
            <div className="text-xs font-serif text-[#141413]/80 leading-relaxed">
              This account is currently suspended. Reinstating will restore creator posting privileges and public showcase visibility.
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="text-xs font-serif text-red-900 leading-relaxed">
                Suspending this creator will immediately revoke publish permissions and mark their profile as restricted.
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="ban-reason"
                className="font-gothic text-xs font-bold uppercase tracking-wider text-[#141413] block"
              >
                Administrative Reason / Violation Note <span className="text-[#d97757]">*</span>
              </label>
              <Textarea
                id="ban-reason"
                placeholder="e.g. Repeated copyright infringement or violation of design community standards..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                required
              />
            </div>
          </div>
        )}

        <div className="pt-3 flex justify-end gap-2.5">
          <Button type="button" variant="outline" size="md" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="button"
            variant={isBanned ? "clay" : "slate"}
            size="md"
            isLoading={isLoading}
            onClick={handleAction}
            disabled={!isBanned && !reason.trim()}
            className={!isBanned ? "!bg-red-600 hover:!bg-red-700 !text-white" : ""}
          >
            {isBanned ? "Reinstate User" : "Confirm Suspension"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
