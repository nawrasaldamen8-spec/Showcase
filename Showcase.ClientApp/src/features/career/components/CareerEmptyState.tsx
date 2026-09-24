import { Plus } from "lucide-react";
import React from "react";
import { Button } from "../../../shared/components/Button.tsx";

export interface CareerEmptyStateProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const CareerEmptyState: React.FC<CareerEmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-10 sm:p-14 text-center rounded-[24px] bg-[#faf9f5] border border-[#cccbc8]/60 shadow-none">
      <div className="w-14 h-14 rounded-2xl bg-[#f0eee6] border border-[#cccbc8]/60 flex items-center justify-center text-[#87867f] mb-5">
        <Icon className="w-7 h-7 stroke-[1.5]" />
      </div>

      <span className="font-gothic text-[11px] font-bold uppercase tracking-[0.18em] text-[#87867f] mb-1">
        Catalog Vacant
      </span>
      <h3 className="font-gothic text-xl sm:text-2xl font-bold uppercase tracking-tight text-[#141413] mb-2">
        {title}
      </h3>
      <p className="font-serif text-[15px] text-[#141413]/70 max-w-md mx-auto mb-6 leading-relaxed">
        {description}
      </p>

      {actionLabel && onAction && (
        <Button
          variant="clay"
          size="md"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={onAction}
          className="shadow-none uppercase tracking-wider text-xs font-bold"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
