import { Calendar, Pencil, Trash2 } from "lucide-react";
import React from "react";
import type { CareerExperience } from "@shared/types/index.ts";

export interface ExperienceCardProps {
  item: CareerExperience;
  onEdit?: (item: CareerExperience) => void;
  onDelete?: (item: CareerExperience) => void;
}

export const ExperienceCard: React.FC<ExperienceCardProps> = ({ item: exp, onEdit, onDelete }) => {
  const formatDateRange = (e: CareerExperience) => {
    const start = e.startDate;
    const end = e.currentlyWorking ? "Present" : e.endDate || "Present";
    return `${start} \u2014 ${end}`;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-7 rounded-2xl sm:rounded-[24px] bg-[#faf9f5] border border-[#cccbc8]/60 hover:border-[#141413] transition-colors shadow-none">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="font-gothic text-xs font-bold uppercase tracking-[0.14em] text-[#d97757] break-words">
              {exp.company}
            </span>
            {exp.currentlyWorking && (
              <span className="font-gothic text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#d97757]/10 text-[#d97757] border border-[#d97757]/30 shrink-0">
                Current Role
              </span>
            )}
          </div>

          <h3 className="font-gothic text-xl sm:text-2xl font-bold uppercase tracking-tight text-[#141413] break-words">
            {exp.jobTitle}
          </h3>

          <div className="flex flex-wrap items-center gap-4 text-xs font-serif text-[#141413]/70 pt-1">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#87867f] shrink-0" />
              <span>{formatDateRange(exp)}</span>
            </span>
          </div>
        </div>

        {(onEdit || onDelete) && (
          <div className="flex items-center gap-1.5 self-end sm:self-start shrink-0">
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(exp)}
                className="p-1.5 sm:p-2 rounded-xl text-[#87867f] hover:text-[#141413] hover:bg-[#f0eee6] transition-colors cursor-pointer"
                aria-label={`Edit ${exp.jobTitle}`}
              >
                <Pencil className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(exp)}
                className="p-1.5 sm:p-2 rounded-xl text-[#87867f] hover:text-red-600 hover:bg-red-50/40 transition-colors cursor-pointer"
                aria-label={`Delete ${exp.jobTitle}`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {exp.description && (
        <p className="font-serif text-[14px] sm:text-[15px] leading-relaxed text-[#141413]/80 mt-3 sm:mt-4 pt-3 border-t border-[#cccbc8]/30 break-words">
          {exp.description}
        </p>
      )}

      {exp.achievements && (
        <div className="mt-3 p-3 rounded-xl bg-[#f0eee6]/60 border border-[#cccbc8]/30">
          <span className="font-gothic text-[10px] font-bold uppercase tracking-wider text-[#87867f] block mb-0.5">
            Notable Milestone
          </span>
          <p className="font-serif text-xs text-[#141413]/85 italic break-words">
            {exp.achievements}
          </p>
        </div>
      )}
    </div>
  );
};
