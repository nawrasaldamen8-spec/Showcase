import { ArrowLeft } from "lucide-react";
import React from "react";
import { Button } from "@shared/components/Button.tsx";

export interface ExperienceStep2Props {
  employmentType: string;
  setEmploymentType: (v: string) => void;
  location: string;
  setLocation: (v: string) => void;
  endDate: string;
  setEndDate: (v: string) => void;
  currentlyWorking: boolean;
  setCurrentlyWorking: (v: boolean) => void;
  description: string;
  setDescription: (v: string) => void;
  achievements: string;
  setAchievements: (v: string) => void;
  skillsText: string;
  setSkillsText: (v: string) => void;
  onBack: () => void;
  isSaving: boolean;
  isEditing: boolean;
}

export const ExperienceStep2: React.FC<ExperienceStep2Props> = ({
  employmentType,
  setEmploymentType,
  location,
  setLocation,
  endDate,
  setEndDate,
  currentlyWorking,
  setCurrentlyWorking,
  description,
  setDescription,
  achievements,
  setAchievements,
  skillsText,
  setSkillsText,
  onBack,
  isSaving,
  isEditing,
}) => {
  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block font-gothic text-xs font-bold uppercase tracking-[0.12em] text-[#141413] mb-1.5">
            Employment Type
          </label>
          <select
            value={employmentType}
            onChange={(e) => setEmploymentType(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-[#f0eee6] border border-[#cccbc8]/60 text-sm text-[#141413] focus:outline-none focus:ring-1 focus:ring-[#141413]"
          >
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
            <option value="Freelance">Freelance</option>
            <option value="Internship">Internship</option>
            <option value="Advisory">Advisory</option>
          </select>
        </div>

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
      </div>

      <div className="p-4 rounded-2xl bg-[#f0eee6]/60 border border-[#cccbc8]/40 space-y-3">
        <div>
          <label className="block font-gothic text-xs font-bold uppercase tracking-[0.12em] text-[#141413] mb-1.5">
            End Date
          </label>
          <input
            type="month"
            value={endDate}
            disabled={currentlyWorking}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-[#faf9f5] border border-[#cccbc8]/60 text-sm text-[#141413] focus:outline-none focus:ring-1 focus:ring-[#141413] disabled:opacity-40 disabled:cursor-not-allowed"
          />
        </div>

        <label className="flex items-center gap-2.5 pt-1 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={currentlyWorking}
            onChange={(e) => setCurrentlyWorking(e.target.checked)}
            className="w-4 h-4 rounded text-[#d97757] focus:ring-0 focus:ring-offset-0"
          />
          <span className="font-gothic text-xs font-bold uppercase tracking-wider text-[#141413]">
            I currently work in this role
          </span>
        </label>
      </div>

      <div>
        <label className="block font-gothic text-xs font-bold uppercase tracking-[0.12em] text-[#141413] mb-1.5">
          Description &amp; Curatorial Focus
        </label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Outline your spatial, design, or directorial responsibilities..."
          className="w-full px-3.5 py-2.5 rounded-xl bg-[#f0eee6] border border-[#cccbc8]/60 text-sm text-[#141413] focus:outline-none focus:ring-1 focus:ring-[#141413] resize-none"
        />
      </div>

      <div>
        <label className="block font-gothic text-xs font-bold uppercase tracking-[0.12em] text-[#141413] mb-1.5">
          Key Achievements &amp; Milestones
        </label>
        <input
          type="text"
          value={achievements}
          onChange={(e) => setAchievements(e.target.value)}
          placeholder="e.g. Curated 14 exhibitions; co-authored daylight monograph"
          className="w-full px-3.5 py-2.5 rounded-xl bg-[#f0eee6] border border-[#cccbc8]/60 text-sm text-[#141413] focus:outline-none focus:ring-1 focus:ring-[#141413]"
        />
      </div>

      <div>
        <label className="block font-gothic text-xs font-bold uppercase tracking-[0.12em] text-[#141413] mb-1.5">
          Skills &amp; Disciplines Applied
        </label>
        <input
          type="text"
          value={skillsText}
          onChange={(e) => setSkillsText(e.target.value)}
          placeholder="e.g. Architectural Curation, Daylight Scenography, Medium Format"
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
          {isSaving ? "Saving..." : isEditing ? "Update Position" : "Save Position"}
        </Button>
      </div>
    </div>
  );
};
