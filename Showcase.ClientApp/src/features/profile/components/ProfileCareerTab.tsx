import { ArrowLeft, ArrowRight } from "lucide-react";
import React from "react";
import {
  AcademicCard,
  AchievementCard,
  CredentialCard,
  ExperienceCard,
  LanguageCard,
  SkillCard,
} from "@features/career/components/index.ts";
import type { PublicCareerData } from "@shared/types/index.ts";

export type CareerSectionId =
  | "experience"
  | "academics"
  | "skills"
  | "credentials"
  | "languages"
  | "achievements";

export interface ProfileCareerTabProps {
  careerData: PublicCareerData | null;
  selectedSection: CareerSectionId | null;
  onSelectSection: (section: CareerSectionId | null) => void;
}

export const ProfileCareerTab: React.FC<ProfileCareerTabProps> = ({
  careerData,
  selectedSection,
  onSelectSection,
}) => {
  const careerSections: Array<{
    id: CareerSectionId;
    title: string;
    count: number;
    visible: boolean;
  }> = [
    {
      id: "experience",
      title: "Experience",
      count: careerData?.experiences?.length ?? 0,
      visible: Boolean(careerData?.visibility?.experience) && (careerData?.experiences?.length ?? 0) > 0,
    },
    {
      id: "academics",
      title: "Academics",
      count: careerData?.academics?.length ?? 0,
      visible: Boolean(careerData?.visibility?.academics) && (careerData?.academics?.length ?? 0) > 0,
    },
    {
      id: "skills",
      title: "Skills",
      count: careerData?.skills?.length ?? 0,
      visible: Boolean(careerData?.visibility?.skills) && (careerData?.skills?.length ?? 0) > 0,
    },
    {
      id: "credentials",
      title: "Credentials",
      count: careerData?.credentials?.length ?? 0,
      visible: Boolean(careerData?.visibility?.credentials) && (careerData?.credentials?.length ?? 0) > 0,
    },
    {
      id: "languages",
      title: "Languages",
      count: careerData?.languages?.length ?? 0,
      visible: Boolean(careerData?.visibility?.languages) && (careerData?.languages?.length ?? 0) > 0,
    },
    {
      id: "achievements",
      title: "Achievements",
      count: careerData?.achievements?.length ?? 0,
      visible: Boolean(careerData?.visibility?.achievements) && (careerData?.achievements?.length ?? 0) > 0,
    },
  ];

  const visibleCareerSections = careerSections.filter((s) => s.visible);

  return (
    <div>
      {/* Default: Career Index / Directory */}
      {selectedSection === null ? (
        <section aria-label="Career Index" className="max-w-4xl">
          {visibleCareerSections.length === 0 ? (
            <div className="p-8 text-center bg-ivory-light rounded-card border border-stone/60 text-cloud-dark font-serif">
              No public career records added yet.
            </div>
          ) : (
            <div className="space-y-3">
              {visibleCareerSections.map((sec) => (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => onSelectSection(sec.id)}
                  className="w-full text-left p-5 sm:p-6 rounded-[20px] bg-ivory-light border border-stone/60 hover:border-slate-dark transition-all group cursor-pointer shadow-none flex items-center justify-between gap-4"
                >
                  <div className="min-w-0 pr-2">
                    <h3 className="font-gothic text-lg sm:text-xl font-bold uppercase tracking-tight text-slate-dark">
                      {sec.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-gothic text-[11px] font-bold uppercase tracking-[0.12em] px-2.5 py-1 rounded-full bg-ivory-medium text-cloud-dark group-hover:text-slate-dark border border-stone/40 transition-colors">
                      {sec.count}
                    </span>
                    <div className="w-8 h-8 rounded-full border border-stone/60 flex items-center justify-center text-cloud-dark group-hover:text-slate-dark group-hover:border-slate-dark group-hover:translate-x-0.5 transition-all">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      ) : (
        /* Dedicated Sub-Section View */
        <div>
          {/* Back to Career Index Navigation */}
          <div className="mb-6">
            <button
              type="button"
              onClick={() => onSelectSection(null)}
              className="inline-flex items-center gap-2 font-gothic text-xs font-bold uppercase tracking-[0.14em] text-cloud-dark hover:text-slate-dark transition-colors group cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
              <span>Back to Career Index</span>
            </button>
          </div>

          {selectedSection && !careerData?.visibility?.[selectedSection] ? (
            <div className="p-8 text-center bg-ivory-light rounded-card border border-stone/60 text-cloud-dark font-serif max-w-4xl">
              This career section is private.
            </div>
          ) : null}

          {selectedSection === "experience" && careerData && Boolean(careerData.visibility.experience) && (
            <section aria-label="Experience" className="space-y-6 max-w-4xl">
              <div className="mb-6">
                <h2 className="font-gothic text-2xl font-bold uppercase tracking-tight text-slate-dark">
                  Experience
                </h2>
              </div>
              <div className="space-y-6">
                {careerData.experiences.map((exp) => (
                  <ExperienceCard key={exp.id} item={exp} />
                ))}
              </div>
            </section>
          )}

          {selectedSection === "academics" && careerData && Boolean(careerData.visibility.academics) && (
            <section aria-label="Academics" className="space-y-6 max-w-4xl">
              <div className="mb-6">
                <h2 className="font-gothic text-2xl font-bold uppercase tracking-tight text-slate-dark">
                  Academics
                </h2>
              </div>
              <div className="space-y-6">
                {careerData.academics.map((acad) => (
                  <AcademicCard key={acad.id} item={acad} />
                ))}
              </div>
            </section>
          )}

          {selectedSection === "skills" && careerData && Boolean(careerData.visibility.skills) && (
            <section aria-label="Skills" className="max-w-5xl">
              <div className="mb-6">
                <h2 className="font-gothic text-2xl font-bold uppercase tracking-tight text-slate-dark">
                  Skills
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {careerData.skills.map((skill) => (
                  <SkillCard key={skill.id} item={skill} />
                ))}
              </div>
            </section>
          )}

          {selectedSection === "credentials" && careerData && Boolean(careerData.visibility.credentials) && (
            <section aria-label="Credentials" className="max-w-5xl">
              <div className="mb-6">
                <h2 className="font-gothic text-2xl font-bold uppercase tracking-tight text-slate-dark">
                  Credentials
                </h2>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
                {careerData.credentials.map((cred) => (
                  <CredentialCard key={cred.id} item={cred} />
                ))}
              </div>
            </section>
          )}

          {selectedSection === "languages" && careerData && Boolean(careerData.visibility.languages) && (
            <section aria-label="Languages" className="max-w-3xl">
              <div className="mb-6">
                <h2 className="font-gothic text-2xl font-bold uppercase tracking-tight text-slate-dark">
                  Languages
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {careerData.languages.map((lang) => (
                  <LanguageCard key={lang.id} item={lang} />
                ))}
              </div>
            </section>
          )}

          {selectedSection === "achievements" && careerData && Boolean(careerData.visibility.achievements) && (
            <section aria-label="Achievements" className="space-y-6 max-w-4xl">
              <div className="mb-6">
                <h2 className="font-gothic text-2xl font-bold uppercase tracking-tight text-slate-dark">
                  Achievements
                </h2>
              </div>
              <div className="space-y-6">
                {careerData.achievements.map((ach) => (
                  <AchievementCard key={ach.id} item={ach} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
};
