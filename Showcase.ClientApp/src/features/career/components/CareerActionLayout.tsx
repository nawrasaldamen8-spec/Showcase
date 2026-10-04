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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 min-h-[80vh]">
      {/* Navigation Breadcrumb */}
      <nav className="mb-6" aria-label="Breadcrumb navigation">
        <Link
          to={backTo}
          className="inline-flex items-center gap-2 font-gothic text-xs font-semibold uppercase tracking-[0.14em] text-cloud-dark hover:text-slate-dark transition-colors group text-decoration-none"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span>{backLabel}</span>
        </Link>
      </nav>

      {/* Screen Header */}
      <header className="border-b border-stone pb-6 mb-8 space-y-2">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4 text-clay" />}
          <span className="font-gothic text-xs font-bold uppercase tracking-[0.16em] text-clay">
            {badge}
          </span>
        </div>

        <h1 className="font-gothic font-extrabold text-3xl sm:text-4xl uppercase tracking-tight text-slate-dark">
          {title}
        </h1>

        <p className="font-serif text-sm sm:text-base text-slate-dark/75 leading-relaxed">
          {subtitle}
        </p>
      </header>

      {/* Main Canvas Container */}
      <div className="bg-ivory-light rounded-2xl sm:rounded-card border border-stone/60 p-6 sm:p-8 space-y-6">
        {children}
      </div>
    </div>
  );
};
