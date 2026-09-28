import { Calendar, ExternalLink } from "lucide-react";
import React from "react";
import type { CareerAchievement } from "@shared/types/index.ts";
import { CareerCardActions } from "./CareerCardActions.tsx";
import { CareerCardShell } from "./CareerCardShell.tsx";

export interface AchievementCardProps {
  item: CareerAchievement;
  onEdit?: (item: CareerAchievement) => void;
  onDelete?: (item: CareerAchievement) => void;
}

export const AchievementCard: React.FC<AchievementCardProps> = ({ item: ach, onEdit, onDelete }) => {
  return (
    <CareerCardShell>
      <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
        {ach.mediaUrl && (
          <div className="w-full md:w-56 h-40 rounded-xl overflow-hidden bg-ivory-medium border border-stone/50 shrink-0">
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

        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-3 sm:gap-4 mb-2">
              <div className="flex flex-wrap items-center gap-2 min-w-0">
                {ach.type && (
                  <span className="font-gothic text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-ivory-medium border border-stone/40 text-cloud-dark shrink-0">
                    {ach.type}
                  </span>
                )}
                {ach.organization && (
                  <span className="font-gothic text-xs font-bold uppercase tracking-[0.14em] text-clay break-words">
                    {ach.organization}
                  </span>
                )}
              </div>

              <CareerCardActions
                itemName={ach.title}
                onEdit={onEdit ? () => onEdit(ach) : undefined}
                onDelete={onDelete ? () => onDelete(ach) : undefined}
                compact
              />
            </div>

            <h3 className="font-gothic text-xl sm:text-2xl font-bold uppercase tracking-tight text-slate-dark break-words">
              {ach.title}
            </h3>

            {ach.date && (
              <div className="flex items-center gap-1.5 text-xs font-serif text-slate-dark/70 mt-1">
                <Calendar className="w-3.5 h-3.5 text-cloud-dark shrink-0" />
                <span className="break-words">Received {ach.date}</span>
              </div>
            )}

            {ach.description && (
              <p className="font-serif text-[14px] sm:text-[15px] leading-relaxed text-slate-dark/80 mt-3 pt-3 border-t border-stone/30 break-words">
                {ach.description}
              </p>
            )}
          </div>

          {ach.url && (
            <div className="mt-4 pt-3 border-t border-stone/30">
              <a
                href={ach.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 font-gothic text-[11px] font-bold uppercase tracking-wider text-clay hover:underline break-words"
              >
                <span>View Link</span>
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              </a>
            </div>
          )}
        </div>
      </div>
    </CareerCardShell>
  );
};
