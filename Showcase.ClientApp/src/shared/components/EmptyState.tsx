import React from "react";
import { Button, type ButtonVariant } from "./Button.tsx";

export interface EmptyStateProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  eyebrow?: string;
  actionLabel?: string;
  actionIcon?: React.ReactNode;
  onAction?: () => void;
  actionVariant?: ButtonVariant;
  className?: string;
  children?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  eyebrow,
  actionLabel,
  actionIcon,
  onAction,
  actionVariant = "clay",
  className = "",
  children,
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-10 sm:p-14 text-center rounded-[24px] bg-[#faf9f5] border border-[#cccbc8]/60 shadow-none ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-[#f0eee6] border border-[#cccbc8]/60 flex items-center justify-center text-[#87867f] mb-5">
        <Icon className="w-7 h-7 stroke-[1.5]" />
      </div>

      {eyebrow && (
        <span className="font-gothic text-[11px] font-bold uppercase tracking-[0.18em] text-[#87867f] mb-1">
          {eyebrow}
        </span>
      )}
      <h3 className="font-gothic text-xl sm:text-2xl font-bold uppercase tracking-tight text-[#141413] mb-2">
        {title}
      </h3>
      <p className="font-serif text-[15px] text-[#141413]/70 max-w-md mx-auto mb-6 leading-relaxed">
        {description}
      </p>

      {actionLabel && onAction && (
        <Button
          variant={actionVariant}
          size="md"
          leftIcon={actionIcon}
          onClick={onAction}
          className="shadow-none uppercase tracking-wider text-xs font-bold"
        >
          {actionLabel}
        </Button>
      )}

      {children && <div className="mt-2">{children}</div>}
    </div>
  );
};
