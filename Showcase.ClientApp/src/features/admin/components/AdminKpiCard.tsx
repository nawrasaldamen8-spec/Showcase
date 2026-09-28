import React from "react";
import type { LucideIcon } from "lucide-react";

export interface AdminKpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  badge?: string;
  badgeVariant?: "default" | "success" | "warning" | "danger";
  onClick?: () => void;
}

export const AdminKpiCard: React.FC<AdminKpiCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  badge,
  badgeVariant = "default",
  onClick,
}) => {
  const badgeClasses = {
    default: "bg-[#e8e5dc] text-cloud-dark border-stone",
    success: "bg-[#2e7d32]/10 text-[#2e7d32] border-[#2e7d32]/30",
    warning: "bg-clay/15 text-clay border-clay/30",
    danger: "bg-red-500/10 text-red-700 border-red-500/30",
  }[badgeVariant];

  return (
    <div
      onClick={onClick}
      className={`p-5 rounded-2xl bg-ivory-light border border-stone transition-all duration-150 ${
        onClick ? "cursor-pointer hover:border-slate-dark hover:bg-ivory-medium/50" : ""
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="font-gothic text-[11px] font-bold uppercase tracking-[0.14em] text-cloud-dark">
          {title}
        </span>
        <div className="h-8 w-8 rounded-xl bg-ivory-medium border border-stone/60 flex items-center justify-center shrink-0">
          <Icon className="h-4 w-4 text-slate-dark" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="font-gothic font-extrabold text-2xl sm:text-3xl text-slate-dark">
          {value}
        </span>
        {badge && (
          <span className={`px-2 py-0.5 rounded-full font-gothic text-[10px] font-bold uppercase tracking-wider border ${badgeClasses}`}>
            {badge}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1 font-serif text-xs text-cloud-dark truncate">{subtitle}</p>
      )}
    </div>
  );
};
