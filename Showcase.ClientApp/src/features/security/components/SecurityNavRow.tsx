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
      className={`group flex items-center justify-between p-4 sm:p-5 rounded-2xl transition-all duration-200 border cursor-pointer text-decoration-none shadow-none ${
        isDanger
          ? "bg-[#faf9f5] border-[#d97757]/30 hover:border-[#d97757] hover:bg-[#d97757]/5"
          : "bg-[#faf9f5] border-[#cccbc8]/60 hover:border-[#141413] hover:bg-[#faf9f5]"
      }`}
    >
      <div className="flex items-center gap-4 min-w-0">
        <div
          className={`flex items-center justify-center h-10 w-10 sm:h-11 sm:w-11 rounded-xl shrink-0 transition-colors ${
            isDanger
              ? "bg-[#d97757]/15 text-[#d97757] group-hover:bg-[#d97757] group-hover:text-[#faf9f5]"
              : "bg-[#f0eee6] text-[#141413] border border-[#cccbc8]/60 group-hover:border-[#141413]"
          }`}
        >
          <Icon className="h-5 w-5 stroke-[1.8]" />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h3
              className={`font-gothic text-sm sm:text-base font-bold uppercase tracking-tight truncate ${
                isDanger ? "text-[#d97757]" : "text-[#141413]"
              }`}
            >
              {title}
            </h3>
            {badge && <div>{badge}</div>}
          </div>

          {description && (
            <p className="font-serif text-xs sm:text-[13px] text-[#87867f] truncate mt-0.5">{description}</p>
          )}
        </div>
      </div>

      <div className="flex items-center shrink-0 ml-3">
        <ChevronRight
          className={`h-5 w-5 transition-transform group-hover:translate-x-0.5 ${
            isDanger ? "text-[#d97757]" : "text-[#87867f] group-hover:text-[#141413]"
          }`}
        />
      </div>
    </Link>
  );
};
