import { ArrowLeft, type LucideIcon } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";

export interface CareerActionLayoutProps {
  title: string;
  subtitle: string;
  badge?: string;
  backTo: string;
  backLabel: string;
  icon?: LucideIcon;
  children: React.ReactNode;
}

export const CareerActionLayout: React.FC<CareerActionLayoutProps> = ({
  title,
  subtitle,
  badge = "Career Trajectory",
  backTo,
  backLabel,
  icon: Icon,
  children,
}) => {
  return (
    <div className="min-h-screen py-5 sm:py-10 px-3.5 sm:px-6 lg:px-8 pb-24">
      <div className="max-w-2xl mx-auto">
        {/* Navigation Back Button */}
        <div className="mb-5 sm:mb-6">
          <Link
            to={backTo}
            className="inline-flex items-center gap-2 font-gothic text-xs font-semibold uppercase tracking-[0.14em] text-[#87867f] hover:text-[#141413] transition-colors group text-decoration-none"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span>{backLabel}</span>
          </Link>
        </div>

        {/* Card Canvas */}
        <div className="bg-[#faf9f5] rounded-2xl sm:rounded-[24px] border border-[#cccbc8]/70 p-5 sm:p-7 lg:p-8 shadow-none space-y-6">
          {/* Header */}
          <div className="border-b border-[#cccbc8]/50 pb-5 space-y-2">
            <div className="flex items-center gap-2">
              {Icon && <Icon className="h-4 w-4 text-[#d97757]" />}
              <span className="font-gothic text-[11px] font-bold uppercase tracking-[0.16em] text-[#d97757]">
                {badge}
              </span>
            </div>

            <h1 className="font-gothic text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-[#141413]">
              {title}
            </h1>

            <p className="font-serif text-sm text-[#87867f] leading-relaxed">{subtitle}</p>
          </div>

          {/* Form Content */}
          <div>{children}</div>
        </div>
      </div>
    </div>
  );
};
