import { X } from "lucide-react";
import React from "react";
import { createPortal } from "react-dom";
import { useEscapeKey, useScrollLock } from "../hooks/index.ts";

export interface LightboxProps {
  imageUrl: string | null;
  onClose: () => void;
  alt?: string;
}

export const Lightbox: React.FC<LightboxProps> = ({
  imageUrl,
  onClose,
  alt = "Inspected plate detail",
}) => {
  const isOpen = Boolean(imageUrl);

  useEscapeKey(onClose, isOpen);
  useScrollLock(isOpen);

  if (!imageUrl) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Image inspection viewer"
      tabIndex={-1}
      className="fixed inset-0 z-50 bg-[#141413]/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200 outline-none"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close image inspector"
        className="absolute top-6 right-6 p-2 rounded-full bg-[#faf9f5]/10 text-[#faf9f5] hover:bg-[#faf9f5]/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#faf9f5] transition-colors cursor-pointer"
      >
        <X className="h-6 w-6" />
      </button>
      <img
        src={imageUrl}
        alt={alt}
        className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg select-none shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
    </div>,
    document.body
  );
};
