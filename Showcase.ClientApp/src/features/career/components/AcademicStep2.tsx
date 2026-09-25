import { ArrowLeft } from "lucide-react";
import React from "react";
import { Button } from "@shared/components/Button.tsx";

export interface AcademicStep2Props {
  endDate: string;
  setEndDate: (v: string) => void;
  currentlyStudying: boolean;
  setCurrentlyStudying: (v: boolean) => void;
  location: string;
  setLocation: (v: string) => void;
  gpa: string;
  setGpa: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  achievements: string;
  setAchievements: (v: string) => void;
  onBack: () => void;
  isSaving: boolean;
  isEditing: boolean;
}

export const AcademicStep2: React.FC<AcademicStep2Props> = ({
  endDate,
  setEndDate,
  currentlyStudying,
  setCurrentlyStudying,
  location,
  setLocation,
  gpa,
  setGpa,
  description,
  setDescription,
  achievements,
  setAchievements,
  onBack,
  isSaving,
  isEditing,
}) => {
  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block font-gothic text-xs font-bold uppercase tracking-[0.12em] text-[#141413] mb-1.5">
            Location
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Copenhagen, Denmark"
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#f0eee6] border border-[#cccbc8]/60 text-sm text-[#141413] focus:outline-none focus:ring-1 focus:ring-[#141413]"
          />
        </div>

        <div>
          <label className="block font-gothic text-xs font-bold uppercase tracking-[0.12em] text-[#141413] mb-1.5">
            Honors / Distinction / GPA
          </label>
          <input
            type="text"
            value={gpa}
            onChange={(e) => setGpa(e.target.value)}
            placeholder="e.g. Summa Cum Laude / 3.9"
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#f0eee6] border border-[#cccbc8]/60 text-sm text-[#141413] focus:outline-none focus:ring-1 focus:ring-[#141413]"
          />
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-[#f0eee6]/60 border border-[#cccbc8]/40 space-y-3">
        <div>
          <label className="block font-gothic text-xs font-bold uppercase tracking-[0.12em] text-[#141413] mb-1.5">
            End Date
          </label>
          <input
            type="month"
            value={endDate}
            disabled={currentlyStudying}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-[#faf9f5] border border-[#cccbc8]/60 text-sm text-[#141413] focus:outline-none focus:ring-1 focus:ring-[#141413] disabled:opacity-40 disabled:cursor-not-allowed"
          />
        </div>

        <label className="flex items-center gap-2.5 pt-1 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={currentlyStudying}
            onChange={(e) => setCurrentlyStudying(e.target.checked)}
            className="w-4 h-4 rounded text-[#d97757] focus:ring-0 focus:ring-offset-0"
          />
          <span className="font-gothic text-xs font-bold uppercase tracking-wider text-[#141413]">
            I am currently studying here
          </span>
        </label>
      </div>

      <div>
        <label className="block font-gothic text-xs font-bold uppercase tracking-[0.12em] text-[#141413] mb-1.5">
          Curricular Focus &amp; Thesis Description
        </label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Thesis: Subterranean Brutalism in Nordic Transit Architecture..."
          className="w-full px-3.5 py-2.5 rounded-xl bg-[#f0eee6] border border-[#cccbc8]/60 text-sm text-[#141413] focus:outline-none focus:ring-1 focus:ring-[#141413] resize-none"
        />
      </div>

      <div>
        <label className="block font-gothic text-xs font-bold uppercase tracking-[0.12em] text-[#141413] mb-1.5">
          Notable Distinctions &amp; Academic Awards
        </label>
        <input
          type="text"
          value={achievements}
          onChange={(e) => setAchievements(e.target.value)}
          placeholder="e.g. Dean's Honors List; Recipient of Nordic Light Travel Grant"
          className="w-full px-3.5 py-2.5 rounded-xl bg-[#f0eee6] border border-[#cccbc8]/60 text-sm text-[#141413] focus:outline-none focus:ring-1 focus:ring-[#141413]"
        />
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-[#cccbc8]/40">
        <Button
          type="button"
          variant="outline"
          size="md"
          onClick={onBack}
          disabled={isSaving}
          className="shadow-none uppercase tracking-wider text-xs font-bold inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </Button>
        <Button
          type="submit"
          variant="clay"
          size="md"
          disabled={isSaving}
          className="shadow-none uppercase tracking-wider text-xs font-bold"
        >
          {isSaving ? "Saving..." : isEditing ? "Update Record" : "Save Record"}
        </Button>
      </div>
    </div>
  );
};
