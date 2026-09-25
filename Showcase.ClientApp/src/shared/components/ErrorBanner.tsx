import { AlertCircle } from "lucide-react";
import React from "react";
import { Button } from "./Button.tsx";

export interface ErrorBannerProps {
  message: string;
  title?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({
  message,
  title,
  onRetry,
  className = "",
}) => {
  return (
    <div
      role="alert"
      className={`flex items-center justify-between gap-3 p-4 rounded-xl bg-[#d97757]/10 border border-[#d97757]/30 text-[#d97757] font-serif text-sm ${className}`}
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
        <div className="flex-1 text-xs sm:text-sm leading-relaxed">
          {title && (
            <span className="font-gothic font-bold uppercase tracking-wider block text-[11px] mb-0.5">
              {title}
            </span>
          )}
          <span>{message}</span>
        </div>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
};
