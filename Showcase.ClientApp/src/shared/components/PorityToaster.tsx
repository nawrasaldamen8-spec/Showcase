import React from "react";
import { Toaster as SonnerToaster } from "sonner";
import { Check, AlertCircle, Info, AlertTriangle, X } from "lucide-react";
import { useMediaQuery } from "@shared/hooks/index.ts";

export const PorityToaster: React.FC = () => {
  const isMobile = useMediaQuery("(max-width: 640px)");

  return (
    <SonnerToaster
      position={isMobile ? "top-center" : "bottom-right"}
      swipeDirections={isMobile ? ["right"] : undefined}
      closeButton
      duration={4500}
      visibleToasts={4}
      icons={{
        success: <Check className="w-4 h-4 text-emerald-800 shrink-0 stroke-[2.2]" />,
        error: <AlertCircle className="w-4 h-4 text-clay shrink-0 stroke-[2.2]" />,
        info: <Info className="w-4 h-4 text-slate-dark shrink-0 stroke-[2.2]" />,
        warning: <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 stroke-[2.2]" />,
        close: <X className="w-3.5 h-3.5 text-cloud-dark hover:text-slate-dark transition-colors" />,
      }}
      toastOptions={{
        unstyled: false,
        classNames: {
          toast:
            "group font-serif bg-ivory-light text-slate-dark border border-stone rounded-2xl p-4 sm:p-5 flex items-start gap-3 shadow-none transition-all duration-200 select-none max-w-sm sm:max-w-md w-full",
          title:
            "font-gothic text-xs font-semibold text-slate-dark leading-snug block mb-0.5",
          description:
            "font-serif text-sm text-cloud-dark leading-snug block",
          actionButton:
            "font-gothic text-[11px] font-bold uppercase tracking-wider bg-clay text-ivory-light rounded-pill px-3.5 py-1.5 transition-all hover:opacity-90 active:scale-95 shadow-none",
          cancelButton:
            "font-gothic text-[11px] font-bold uppercase tracking-wider bg-stone/30 text-slate-dark border border-stone rounded-pill px-3 py-1.5 hover:bg-stone/50 shadow-none",
          closeButton:
            "border border-stone/60 bg-ivory-light hover:bg-ivory-medium text-cloud-dark hover:text-slate-dark rounded-full transition-colors p-1.5 shadow-none",
          success: "border-l-4 border-l-emerald-800 bg-ivory-light text-slate-dark",
          error: "border-l-4 border-l-clay bg-ivory-light text-slate-dark",
          info: "border-l-4 border-l-slate-dark bg-ivory-light text-slate-dark",
          warning: "border-l-4 border-l-amber bg-ivory-light text-slate-dark",
        },
      }}
    />
  );
};
