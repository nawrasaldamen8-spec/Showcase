import { Pencil, Trash2 } from "lucide-react";
import React from "react";
import type { CareerSkill } from "@shared/types/index.ts";

export interface SkillCardProps {
  item: CareerSkill;
  onEdit?: (item: CareerSkill) => void;
  onDelete?: (item: CareerSkill) => void;
}

export const SkillCard: React.FC<SkillCardProps> = ({ item: skill, onEdit, onDelete }) => {
  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-[#faf9f5] border border-[#cccbc8]/60 hover:border-[#141413] transition-colors flex flex-col justify-between shadow-none group">
      <div className="min-w-0">
        <span className="font-gothic text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#f0eee6] border border-[#cccbc8]/40 text-[#87867f] inline-block mb-2 break-words">
          {skill.category || "General"}
        </span>
        <h4 className="font-gothic text-base font-bold uppercase tracking-tight text-[#141413] break-words">
          {skill.name}
        </h4>
      </div>

      {(onEdit || onDelete) && (
        <div className="flex items-center justify-end gap-1.5 mt-3 sm:mt-4 pt-3 border-t border-[#cccbc8]/30 shrink-0">
          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(skill)}
              className="p-1.5 rounded-lg text-[#87867f] hover:text-[#141413] hover:bg-[#f0eee6] transition-colors cursor-pointer"
              aria-label={`Edit ${skill.name}`}
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(skill)}
              className="p-1.5 rounded-lg text-[#87867f] hover:text-red-600 hover:bg-red-50/40 transition-colors cursor-pointer"
              aria-label={`Delete ${skill.name}`}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
