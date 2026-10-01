import React, { useState } from "react";
import { KeyRound, ShieldAlert } from "lucide-react";
import { Button } from "@shared/components/Button.tsx";
import { Input } from "@shared/components/Input.tsx";
import { Modal } from "@shared/components/Modal.tsx";

export interface AdminPasswordConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (password: string) => Promise<void>;
  title: string;
  description: string;
  actionLabel: string;
  variant?: "clay" | "slate" | "outline";
}

export const AdminPasswordConfirmModal: React.FC<AdminPasswordConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  actionLabel,
  variant = "clay",
}) => {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleClose = () => {
    setPassword("");
    setErrorMessage(null);
    onClose();
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setErrorMessage("Please enter your current administrator password.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    try {
      await onConfirm(password);
      handleClose();
    } catch (err: unknown) {
      const errorText =
        err instanceof Error ? err.message : "Failed to verify administrator credentials.";
      setErrorMessage(errorText);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      description={description}
      size="md"
    >
      <form onSubmit={handleFormSubmit} className="space-y-4 pt-2">
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs font-serif text-slate-dark/85 leading-relaxed">
            Changing administrative permissions requires re-authenticating with your personal admin password.
          </div>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="admin-confirm-password"
            className="font-gothic text-xs font-bold uppercase tracking-wider text-slate-dark block"
          >
            Your Admin Password <span className="text-clay">*</span>
          </label>
          <div className="relative">
            <Input
              id="admin-confirm-password"
              type="password"
              placeholder="Enter your current password..."
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              autoFocus
              required
              disabled={isLoading}
            />
            <KeyRound className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cloud-dark pointer-events-none" />
          </div>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs font-serif text-red-800">
            {errorMessage}
          </div>
        )}

        <div className="pt-3 flex justify-end gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant={variant}
            size="md"
            isLoading={isLoading}
            disabled={!password.trim()}
          >
            {actionLabel}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
