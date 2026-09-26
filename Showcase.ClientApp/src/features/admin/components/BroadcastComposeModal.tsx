import React, { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@shared/components/Button.tsx";
import { Input } from "@shared/components/Input.tsx";
import { Modal } from "@shared/components/Modal.tsx";
import { Textarea } from "@shared/components/Textarea.tsx";
import type { BroadcastAnnouncementItem } from "@shared/types/index.ts";

export interface BroadcastComposeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (
    item: Omit<BroadcastAnnouncementItem, "id" | "publishedAt" | "adminUsername">
  ) => Promise<void>;
}

export const BroadcastComposeModal: React.FC<BroadcastComposeModalProps> = ({
  isOpen,
  onClose,
  onSend,
}) => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [scope, setScope] = useState<BroadcastAnnouncementItem["scope"]>("all_users");
  const [severity, setSeverity] = useState<BroadcastAnnouncementItem["severity"]>("update");
  const [targetUserId, setTargetUserId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    setIsLoading(true);
    try {
      await onSend({
        title: title.trim(),
        message: message.trim(),
        scope,
        severity,
        targetUserId: scope === "direct_user" ? targetUserId.trim() : undefined,
      });
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Compose Platform Broadcast / Notice"
      description="Publish an official announcement to notifications feeds or issue a direct system warning."
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <div className="space-y-1.5">
          <label
            htmlFor="broadcast-title"
            className="font-gothic text-xs font-bold uppercase tracking-wider text-[#141413] block"
          >
            Announcement Title <span className="text-[#d97757]">*</span>
          </label>
          <Input
            id="broadcast-title"
            placeholder="e.g. Autumn Architecture Showcase Call for Submissions"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            autoFocus
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label
              htmlFor="broadcast-scope"
              className="font-gothic text-xs font-bold uppercase tracking-wider text-[#141413] block"
            >
              Audience Scope
            </label>
            <select
              id="broadcast-scope"
              value={scope}
              onChange={(e) => setScope(e.target.value as BroadcastAnnouncementItem["scope"])}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#cccbc8] bg-[#faf9f5] font-serif text-xs text-[#141413] focus:outline-none focus:ring-1 focus:ring-[#141413]"
            >
              <option value="all_users">All Registered Users</option>
              <option value="creators_only">Verified &amp; Active Creators</option>
              <option value="direct_user">Direct User Warning (Individual)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="broadcast-severity"
              className="font-gothic text-xs font-bold uppercase tracking-wider text-[#141413] block"
            >
              Category / Severity
            </label>
            <select
              id="broadcast-severity"
              value={severity}
              onChange={(e) => setSeverity(e.target.value as BroadcastAnnouncementItem["severity"])}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#cccbc8] bg-[#faf9f5] font-serif text-xs text-[#141413] focus:outline-none focus:ring-1 focus:ring-[#141413]"
            >
              <option value="update">Platform Update / Feature Release</option>
              <option value="contest">Curated Contest / Editorial Spotlight</option>
              <option value="info">General Information</option>
              <option value="warning">System Warning / Policy Notice</option>
            </select>
          </div>
        </div>

        {scope === "direct_user" && (
          <div className="space-y-1.5">
            <label
              htmlFor="target-user-id"
              className="font-gothic text-xs font-bold uppercase tracking-wider text-[#141413] block"
            >
              Target User Handle or ID <span className="text-[#d97757]">*</span>
            </label>
            <Input
              id="target-user-id"
              placeholder="e.g. elena_v"
              value={targetUserId}
              onChange={(e) => setTargetUserId(e.target.value)}
              required
            />
          </div>
        )}

        <div className="space-y-1.5">
          <label
            htmlFor="broadcast-msg"
            className="font-gothic text-xs font-bold uppercase tracking-wider text-[#141413] block"
          >
            Announcement Message Body <span className="text-[#d97757]">*</span>
          </label>
          <Textarea
            id="broadcast-msg"
            placeholder="Write clear, professional instructions or news for creators..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            required
          />
        </div>

        <div className="pt-3 flex justify-end gap-2.5">
          <Button type="button" variant="outline" size="md" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="clay"
            size="md"
            isLoading={isLoading}
            leftIcon={<Send className="w-4 h-4" />}
            disabled={!title.trim() || !message.trim()}
          >
            Dispatch Broadcast
          </Button>
        </div>
      </form>
    </Modal>
  );
};
