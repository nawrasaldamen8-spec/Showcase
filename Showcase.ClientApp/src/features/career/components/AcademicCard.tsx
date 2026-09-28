import { Calendar } from "lucide-react";
import React from "react";
import type { CareerAcademic } from "@shared/types/index.ts";
import { formatCareerDateRange } from "../utils.ts";
import { CareerCardActions } from "./CareerCardActions.tsx";
import { CareerCardShell } from "./CareerCardShell.tsx";

export interface AcademicCardProps {
  item: CareerAcademic;
  onEdit?: (item: CareerAcademic) => void;
  onDelete?: (item: CareerAcademic) => void;
}

export const AcademicCard: React.FC<AcademicCardProps> = ({ item: acad, onEdit, onDelete }) => {
  return (
    <CareerCardShell>
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="font-gothic text-xs font-bold uppercase tracking-[0.14em] text-clay break-words">
              {acad.institution}
            </span>
            {acad.gpa && (
              <span className="font-gothic text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-ivory-medium border border-stone/40 text-cloud-dark shrink-0">
                {acad.gpa}
              </span>
            )}
            {acad.currentlyStudying && (
              <span className="font-gothic text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-clay/10 text-clay border border-clay/30 shrink-0">
                Currently Enrolled
              </span>
            )}
          </div>

          <h3 className="font-gothic text-xl sm:text-2xl font-bold uppercase tracking-tight text-slate-dark break-words">
            {acad.degree}
          </h3>
          <p className="font-serif text-[14px] sm:text-[15px] font-medium text-slate-dark break-words">
            {acad.fieldOfStudy}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs font-serif text-slate-dark/70 pt-1">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-cloud-dark shrink-0" />
              <span>{formatCareerDateRange(acad.startDate, acad.endDate, acad.currentlyStudying)}</span>
            </span>
          </div>
        </div>

        <CareerCardActions
          itemName={acad.degree}
          onEdit={onEdit ? () => onEdit(acad) : undefined}
          onDelete={onDelete ? () => onDelete(acad) : undefined}
        />
      </div>

      {acad.achievements && (
        <div className="mt-3 sm:mt-4 p-3 rounded-xl bg-ivory-medium/60 border border-stone/30">
          <span className="font-gothic text-[10px] font-bold uppercase tracking-wider text-cloud-dark block mb-0.5">
            Honors &amp; Awards
          </span>
          <p className="font-serif text-xs text-slate-dark/85 italic break-words">
            {acad.achievements}
          </p>
        </div>
      )}
    </CareerCardShell>
  );
};
