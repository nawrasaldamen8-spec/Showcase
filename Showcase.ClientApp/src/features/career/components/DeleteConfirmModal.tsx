import { AlertTriangle, X } from "lucide-react";
import React, { useEffect } from "react";
import { Button } from "../../../shared/components/Button.tsx";

export interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  itemName: string;
  isDeleting?: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  itemName,
  isDeleting = false,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isDeleting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isDeleting, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#141413]/60 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div className="relative w-full max-w-md rounded-[24px] bg-[#faf9f5] border border-[#cccbc8] p-6 sm:p-7 shadow-none text-[#141413]">
        <button
          type="button"
          onClick={onClose}
          disabled={isDeleting}
          className="absolute top-5 right-5 text-[#87867f] hover:text-[#141413] transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-[#d97757]/10 border border-[#d97757]/30 text-[#d97757] flex items-center justify-center mb-4">
          <AlertTriangle className="w-6 h-6 stroke-[1.75]" />
        </div>

        <span className="font-gothic text-[10px] font-bold uppercase tracking-[0.2em] text-[#d97757] block mb-1">
          Irreversible Action
        </span>
        <h3 id="delete-modal-title" className="font-gothic text-xl font-bold uppercase tracking-tight text-[#141413] mb-2">
          {title}
        </h3>
        <p className="font-serif text-[15px] text-[#141413]/70 mb-6 leading-relaxed">
          Are you sure you wish to expunge <strong className="text-[#141413] font-sans font-semibold">"{itemName}"</strong> from your curated record? This action cannot be reversed.
        </p>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#cccbc8]/40">
          <Button
            variant="outline"
            size="md"
            onClick={onClose}
            disabled={isDeleting}
            className="shadow-none text-xs uppercase font-bold tracking-wider"
          >
            Cancel
          </Button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-gothic text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isDeleting ? "Expunging..." : "Expunge Record"}
          </button>
        </div>
      </div>
    </div>
  );
};
