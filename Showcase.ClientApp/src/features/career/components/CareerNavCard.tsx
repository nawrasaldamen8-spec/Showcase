import { ArrowUpRight } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";

export interface CareerNavCardProps {
  title: string;
  count: number;
  countLabel?: string;
  description: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const CareerNavCard: React.FC<CareerNavCardProps> = ({
  title,
  count,
  countLabel = "items",
  description,
  to,
  icon: Icon,
}) => {
  return (
    <Link
      to={to}
      className="group relative flex flex-col justify-between p-6 sm:p-7 rounded-[24px] bg-[#faf9f5] border border-[#cccbc8]/60 hover:border-[#141413] transition-colors duration-200 shadow-none text-decoration-none"
    >
      <div>
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="w-11 h-11 rounded-2xl bg-[#f0eee6] border border-[#cccbc8]/60 flex items-center justify-center text-[#141413] group-hover:bg-[#141413] group-hover:text-[#faf9f5] transition-colors">
            <Icon className="w-5 h-5 stroke-[1.75]" />
          </div>

          <div className="flex items-center gap-2">
            <span className="font-gothic text-[11px] font-bold uppercase tracking-[0.14em] px-2.5 py-1 rounded-full bg-[#f0eee6] text-[#87867f] group-hover:text-[#141413] border border-[#cccbc8]/40 transition-colors">
              {count} {countLabel}
            </span>
            <div className="w-8 h-8 rounded-full border border-[#cccbc8]/60 flex items-center justify-center text-[#87867f] group-hover:text-[#141413] group-hover:border-[#141413] transition-colors">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
        </div>

        <h3 className="font-gothic text-lg sm:text-xl font-bold uppercase tracking-tight text-[#141413] mb-2 group-hover:text-[#d97757] transition-colors">
          {title}
        </h3>
        <p className="font-serif text-[14px] leading-relaxed text-[#141413]/70 line-clamp-2">
          {description}
        </p>
      </div>
    </Link>
  );
};
