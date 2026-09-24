import { ArrowLeft, Plus } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../../../shared/components/Button.tsx";

export interface CareerHeaderProps {
  sectionTitle: string;
  badge?: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  backTo?: string;
  backLabel?: string;
}

export const CareerHeader: React.FC<CareerHeaderProps> = ({
  sectionTitle,
  badge = "Curated Dossier",
  description,
  actionLabel,
  onAction,
  backTo = "/career",
  backLabel = "Career Hub",
}) => {
  return (
    <div className="mb-8 pb-6 border-b border-[#cccbc8]/60">
      {/* Editorial Breadcrumb */}
      <div className="flex items-center gap-2 mb-3">
        <Link
          to={backTo}
          className="inline-flex items-center gap-1.5 text-xs font-gothic font-bold uppercase tracking-[0.14em] text-[#87867f] hover:text-[#141413] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{backLabel}</span>
        </Link>
        <span className="text-[#87867f] text-xs">/</span>
        <span className="text-xs font-gothic font-bold uppercase tracking-[0.14em] text-[#d97757]">
          {sectionTitle}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="max-w-2xl">
          <span className="font-gothic text-[11px] font-bold uppercase tracking-[0.18em] text-[#87867f] block mb-1">
            {badge}
          </span>
          <h1 className="font-gothic text-2xl sm:text-3xl lg:text-4xl font-extrabold uppercase tracking-tight text-[#141413]">
            {sectionTitle}
          </h1>
          <p className="font-serif text-[15px] sm:text-[16px] text-[#141413]/70 mt-1.5 leading-relaxed">
            {description}
          </p>
        </div>

        {actionLabel && onAction && (
          <div className="shrink-0">
            <Button
              variant="clay"
              size="md"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={onAction}
              className="shadow-none uppercase tracking-wider text-xs font-bold"
            >
              {actionLabel}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
