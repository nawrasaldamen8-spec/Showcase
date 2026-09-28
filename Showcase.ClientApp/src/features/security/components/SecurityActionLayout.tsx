import { ArrowLeft, Shield } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";

export interface SecurityActionLayoutProps {
  title: string;
  subtitle: string;
  badge?: string;
  backTo?: string;
  backLabel?: string;
  children: React.ReactNode;
}

export const SecurityActionLayout: React.FC<SecurityActionLayoutProps> = ({
  title,
  subtitle,
  badge = "Security Setting",
  backTo = "/settings/security",
  backLabel = "Back to Account Security",
  children,
}) => {
  return (
    <div className="min-h-screen bg-ivory-medium py-5 sm:py-10 px-3.5 sm:px-6 lg:px-8 pb-24">
      <div className="max-w-xl mx-auto">
        {/* Navigation Back Button */}
        <div className="mb-5 sm:mb-6">
          <Link
            to={backTo}
            className="inline-flex items-center gap-2 font-gothic text-xs font-semibold uppercase tracking-[0.14em] text-cloud-dark hover:text-slate-dark transition-colors group text-decoration-none"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span>{backLabel}</span>
          </Link>
        </div>

        {/* Card Canvas */}
        <div className="bg-ivory-light rounded-2xl sm:rounded-card border border-stone/60 p-5 sm:p-7 lg:p-8 shadow-none space-y-6">
          {/* Header */}
          <div className="border-b border-stone/50 pb-5 space-y-2">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-clay" />
              <span className="font-gothic text-[11px] font-bold uppercase tracking-[0.16em] text-clay">
                {badge}
              </span>
            </div>

            <h1 className="font-gothic text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-slate-dark">
              {title}
            </h1>

            <p className="font-serif text-sm text-cloud-dark leading-relaxed">{subtitle}</p>
          </div>

          {/* Form / Content */}
          <div>{children}</div>
        </div>
      </div>
    </div>
  );
};
