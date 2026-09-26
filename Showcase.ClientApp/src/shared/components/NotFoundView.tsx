import { ArrowLeft, LayoutGrid } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "./Button.tsx";

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
      <div className="inline-flex items-center justify-center p-4 rounded-full bg-[#faf9f5] border border-[#cccbc8]/60 text-[#87867f] mb-6">
        <Icon className="h-10 w-10 stroke-[1.5]" />
      </div>
      <span className="font-gothic text-xs font-bold uppercase tracking-[0.16em] text-[#87867f] block mb-2">
        {eyebrow}
      </span>
      <h1 className="font-gothic text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-[#141413]">
        {title}
      </h1>
      <p className="font-serif text-[18px] text-[#141413]/80 mt-4 leading-relaxed">
        {description}
      </p>
      <div className="mt-8">
        <Link to={backHref}>
          <Button variant="slate" size="md" leftIcon={<ArrowLeft className="h-4 w-4" />}>
            {backLabel}
          </Button>
        </Link>
      </div>
    </div>
  );
};
