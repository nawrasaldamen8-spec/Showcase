import { ChevronRight, type LucideIcon } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";

export interface SecurityNavRowProps {
  to: string;
  icon: LucideIcon;
  title: string;
  description?: string;
  badge?: React.ReactNode;
  variant?: "default" | "danger";
}

export const SecurityNavRow: React.FC<SecurityNavRowProps> = ({
  to,
  icon: Icon,
  title,
  description,
  badge,
  variant = "default",
}) => {
  const isDanger = variant === "danger";

  return (
    <Link
      to={to}
      className={`group flex items-center justify-between p-3.5 sm:p-5 rounded-2xl transition-all duration-200 border cursor-pointer text-decoration-none shadow-none ${
        isDanger
          ? "bg-ivory-light border-clay/30 hover:border-clay hover:bg-clay/5"
          : "bg-ivory-light border-stone/60 hover:border-slate-dark hover:bg-ivory-light"
      }`}
    >
      <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
        <div
          className={`flex items-center justify-center h-10 w-10 sm:h-11 sm:w-11 rounded-xl shrink-0 transition-colors ${
            isDanger
              ? "bg-clay/15 text-clay group-hover:bg-clay group-hover:text-ivory-light"
              : "bg-ivory-medium text-slate-dark border border-stone/60 group-hover:border-slate-dark"
          }`}
        >
          <Icon className="h-5 w-5 stroke-[1.8]" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3
              className={`font-gothic text-xs sm:text-base font-bold uppercase tracking-tight truncate ${
                isDanger ? "text-clay" : "text-slate-dark"
              }`}
            >
              {title}
            </h3>
            {badge && <div className="shrink-0">{badge}</div>}
          </div>

          {description && (
            <p className="font-serif text-[11px] sm:text-[13px] text-cloud-dark truncate mt-0.5">{description}</p>
          )}
        </div>
      </div>

      <div className="flex items-center shrink-0 ml-3">
        <ChevronRight
          className={`h-5 w-5 transition-transform group-hover:translate-x-0.5 ${
            isDanger ? "text-clay" : "text-cloud-dark group-hover:text-slate-dark"
          }`}
        />
      </div>
    </Link>
  );
};
