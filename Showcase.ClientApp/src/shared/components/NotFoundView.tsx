import { ArrowLeft, LayoutGrid } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";

export interface NotFoundViewProps {
  eyebrow?: string;
  title?: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export const NotFoundView: React.FC<NotFoundViewProps> = ({
  eyebrow = "Pority \u2022 404",
  title = "Page Not Found",
  description = "The page you are looking for does not exist or has been moved.",
  backHref = "/studio",
  backLabel = "Back to Studio",
  icon: Icon = LayoutGrid,
}) => {
  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      <div className="inline-flex items-center justify-center p-4 rounded-full bg-ivory-light border border-stone/60 text-cloud-dark mb-6">
        <Icon className="h-10 w-10 stroke-[1.5]" />
      </div>
      <span className="font-gothic text-xs font-bold uppercase tracking-[0.16em] text-cloud-dark block mb-2">
        {eyebrow}
      </span>
      <h1 className="font-gothic text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-slate-dark">
        {title}
      </h1>
      <p className="font-serif text-[18px] text-slate-dark/80 mt-4 leading-relaxed">
        {description}
      </p>
      <div className="mt-8">
        <Link
          to={backHref}
          className="inline-flex items-center justify-center gap-2 rounded-pill bg-slate-dark text-ivory-light px-6 py-2.5 font-gothic text-[13px] font-medium uppercase tracking-[0.10em] hover:bg-[#282725] active:bg-black transition-colors"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" />
          <span>{backLabel}</span>
        </Link>
      </div>
    </div>
  );
};
