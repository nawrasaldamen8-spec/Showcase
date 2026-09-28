import React from "react";
import type { CareerSkill } from "@shared/types/index.ts";
import { CareerCardActions } from "./CareerCardActions.tsx";
import { CareerCardShell } from "./CareerCardShell.tsx";

export interface SkillCardProps {
  item: CareerSkill;
  onEdit?: (item: CareerSkill) => void;
  onDelete?: (item: CareerSkill) => void;
}

export const SkillCard: React.FC<SkillCardProps> = ({ item: skill, onEdit, onDelete }) => {
  return (
    <CareerCardShell className="p-4 sm:p-5 flex flex-col justify-between group">
      <div className="min-w-0">
        <span className="font-gothic text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-ivory-medium border border-stone/40 text-cloud-dark inline-block mb-2 break-words">
          {skill.category || "General"}
        </span>
        <h4 className="font-gothic text-base font-bold uppercase tracking-tight text-slate-dark break-words">
          {skill.name}
        </h4>
      </div>

      {(onEdit || onDelete) && (
        <div className="flex items-center justify-end gap-1.5 mt-3 sm:mt-4 pt-3 border-t border-stone/30 shrink-0">
          <CareerCardActions
            itemName={skill.name}
            onEdit={onEdit ? () => onEdit(skill) : undefined}
            onDelete={onDelete ? () => onDelete(skill) : undefined}
            compact
          />
        </div>
      )}
    </CareerCardShell>
  );
};
