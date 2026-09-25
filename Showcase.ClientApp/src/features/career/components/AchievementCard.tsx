import { Calendar, ExternalLink, Pencil, Trash2 } from "lucide-react";
import React from "react";
import type { CareerAchievement } from "@shared/types/index.ts";

export interface AchievementCardProps {
  item: CareerAchievement;
  onEdit: (item: CareerAchievement) => void;
  onDelete: (item: CareerAchievement) => void;
}

export const AchievementCard: React.FC<AchievementCardProps> = ({ item: ach, onEdit, onDelete }) => {
  return (
    <div className="p-6 sm:p-7 rounded-[24px] bg-[#faf9f5] border border-[#cccbc8]/60 hover:border-[#141413] transition-colors shadow-none">
      <div className="flex flex-col md:flex-row gap-6">
        {ach.mediaUrl && (
          <div className="w-full md:w-56 h-40 rounded-xl overflow-hidden bg-[#f0eee6] border border-[#cccbc8]/50 shrink-0">
            <img
              src={ach.mediaUrl}
              alt={ach.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = "none";
              }}
            />
          </div>
        )}

        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="flex flex-wrap items-center gap-2">
                {ach.type && (
                  <span className="font-gothic text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#f0eee6] border border-[#cccbc8]/40 text-[#87867f]">
                    {ach.type}
                  </span>
                )}
                {ach.organization && (
                  <span className="font-gothic text-xs font-bold uppercase tracking-[0.14em] text-[#d97757]">
                    {ach.organization}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onEdit(ach)}
                  className="p-1.5 rounded-lg text-[#87867f] hover:text-[#141413] hover:bg-[#f0eee6] transition-colors cursor-pointer"
                  aria-label={`Edit ${ach.title}`}
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(ach)}
                  className="p-1.5 rounded-lg text-[#87867f] hover:text-red-600 hover:bg-red-50/40 transition-colors cursor-pointer"
                  aria-label={`Delete ${ach.title}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <h3 className="font-gothic text-xl sm:text-2xl font-bold uppercase tracking-tight text-[#141413]">
              {ach.title}
            </h3>

            {ach.date && (
              <div className="flex items-center gap-1.5 text-xs font-serif text-[#141413]/70 mt-1">
                <Calendar className="w-3.5 h-3.5 text-[#87867f]" />
                <span>Conferred {ach.date}</span>
              </div>
            )}

            {ach.description && (
              <p className="font-serif text-[15px] leading-relaxed text-[#141413]/80 mt-3 pt-3 border-t border-[#cccbc8]/30">
                {ach.description}
              </p>
            )}
          </div>

          {ach.url && (
            <div className="mt-4 pt-3 border-t border-[#cccbc8]/30">
              <a
                href={ach.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 font-gothic text-[11px] font-bold uppercase tracking-wider text-[#d97757] hover:underline"
              >
                <span>View Official Citation</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
