import { Pencil, Trash2 } from "lucide-react";
import React from "react";
import type { CareerSkill } from "@shared/types/index.ts";

export interface SkillCardProps {
  item: CareerSkill;
  onEdit: (item: CareerSkill) => void;
  onDelete: (item: CareerSkill) => void;
}

export const SkillCard: React.FC<SkillCardProps> = ({ item: skill, onEdit, onDelete }) => {
  return (
    <div className="p-5 rounded-[20px] bg-[#faf9f5] border border-[#cccbc8]/60 hover:border-[#141413] transition-colors flex flex-col justify-between shadow-none group">
      <div>
        <span className="font-gothic text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#f0eee6] border border-[#cccbc8]/40 text-[#87867f] inline-block mb-2">
          {skill.category || "General"}
        </span>
        <h4 className="font-gothic text-base font-bold uppercase tracking-tight text-[#141413]">
          {skill.name}
        </h4>
      </div>

      <div className="flex items-center justify-end gap-1.5 mt-4 pt-3 border-t border-[#cccbc8]/30">
        <button
          type="button"
          onClick={() => onEdit(skill)}
          className="p-1.5 rounded-lg text-[#87867f] hover:text-[#141413] hover:bg-[#f0eee6] transition-colors cursor-pointer"
          aria-label={`Edit ${skill.name}`}
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onDelete(skill)}
          className="p-1.5 rounded-lg text-[#87867f] hover:text-red-600 hover:bg-red-50/40 transition-colors cursor-pointer"
          aria-label={`Delete ${skill.name}`}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
