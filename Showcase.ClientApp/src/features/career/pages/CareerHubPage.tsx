import {
  ArrowRight,
  ArrowUpRight,
  Award,
  Briefcase,
  Globe,
  GraduationCap,
  Plus,
  Sparkles,
  Trophy,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiClient } from "@shared/api/apiClient.ts";
import type { CareerExperience, CareerSummary } from "@shared/types/index.ts";
import { CareerNavCard } from "../components/CareerNavCard.tsx";

export const CareerHubPage: React.FC = () => {
  const [summary, setSummary] = useState<CareerSummary | null>(null);
  const [recentExperiences, setRecentExperiences] = useState<CareerExperience[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        const [summaryData, experiencesData] = await Promise.all([
          apiClient.getCareerSummary().catch(() => null),
          apiClient.getExperiences().catch(() => []),
        ]);
        if (mounted) {
          if (summaryData) setSummary(summaryData);
          if (experiencesData) setRecentExperiences(experiencesData);
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to load career hub data", err);
        if (mounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  const sections = [
    {
      title: "Experience",
      count: summary?.experiencesCount ?? 0,
      countLabel: "roles",
      description: "Professional studios, leadership roles, and architectural practice.",
      to: "/career/experience",
      icon: Briefcase,
    },
    {
      title: "Academics",
      count: summary?.academicsCount ?? 0,
      countLabel: "degrees",
      description: "Degrees, diplomas, and research institutions.",
      to: "/career/academics",
      icon: GraduationCap,
    },
    {
      title: "Skills",
      count: summary?.skillsCount ?? 0,
      countLabel: "skills",
      description: "Competencies, software, and technical methodologies.",
      to: "/career/skills",
      icon: Sparkles,
    },
    {
      title: "Credentials",
      count: summary?.credentialsCount ?? 0,
      countLabel: "licenses",
      description: "Architectural licenses and professional accreditations.",
      to: "/career/credentials",
      icon: Award,
    },
    {
      title: "Languages",
      count: summary?.languagesCount ?? 0,
      countLabel: "languages",
      description: "Working languages and proficiency levels.",
      to: "/career/languages",
      icon: Globe,
    },
    {
      title: "Achievements",
      count: summary?.achievementsCount ?? 0,
      countLabel: "honors",
      description: "Honors, design competitions, and monograph publications.",
      to: "/career/achievements",
      icon: Trophy,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-10 sm:space-y-12">
      {/* Overview Header with Quick Metric Badges */}
      <div className="border-b border-stone/60 pb-6 sm:pb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="font-gothic text-[11px] font-bold uppercase tracking-[0.2em] text-clay block mb-1.5">
            Curated Trajectory
          </span>
          <h1 className="font-gothic text-3xl sm:text-4xl lg:text-5xl font-extrabold uppercase tracking-tight text-slate-dark">
            Career Hub
          </h1>
          <p className="font-serif text-sm sm:text-base text-slate-dark/70 mt-2 max-w-2xl leading-relaxed">
            Record your verified employment history, academic credentials, and design accolades.
          </p>
        </div>

        <Link
          to="/career/experience/new"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-slate-dark hover:bg-slate-dark/90 text-ivory-light font-gothic text-xs font-bold uppercase tracking-wider transition-all self-start sm:self-auto cursor-pointer text-decoration-none min-h-[46px]"
        >
          <Plus className="w-4 h-4" />
          <span>Add Milestone</span>
        </Link>
      </div>

      {/* Grid of 6 Category Navigation Cards (Responsive: 1 col on mobile, 2 on tablet, 3 on desktop) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {sections.map((section) => (
          <CareerNavCard
            key={section.to}
            title={section.title}
            count={loading ? 0 : section.count}
            countLabel={section.countLabel}
            description={section.description}
            to={section.to}
            icon={section.icon}
          />
        ))}
      </div>

      {/* Holistic Timeline Snapshot: Chronological Experience Summary */}
      <section className="bg-ivory-light border border-stone/60 rounded-2xl sm:rounded-card p-6 sm:p-8 space-y-6 shadow-none">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone/50 pb-4">
          <div className="space-y-1">
            <span className="font-gothic text-[11px] font-bold uppercase tracking-[0.16em] text-cloud-dark block">
              Holistic Overview
            </span>
            <h2 className="font-gothic font-bold text-xl sm:text-2xl uppercase tracking-tight text-slate-dark">
              Practice Chronology &bull; Active Roles
            </h2>
          </div>

          <Link
            to="/career/experience"
            className="inline-flex items-center gap-1.5 font-gothic text-xs font-bold uppercase tracking-wider text-clay hover:underline text-decoration-none self-start sm:self-auto"
          >
            <span>Manage All Roles</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentExperiences.length > 0 ? (
          <div className="divide-y divide-stone/40">
            {recentExperiences.slice(0, 4).map((exp) => (
              <div
                key={exp.id}
                className="py-4 first:pt-1 last:pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-gothic font-bold text-base text-slate-dark uppercase tracking-tight">
                      {exp.jobTitle}
                    </h3>
                    {exp.currentlyWorking && (
                      <span className="px-2.5 py-0.5 rounded-full bg-[#2e7d32]/10 text-[#2e7d32] border border-[#2e7d32]/30 font-gothic text-[10px] font-bold uppercase tracking-wider">
                        Current Role
                      </span>
                    )}
                  </div>
                  <p className="font-serif text-sm text-cloud-dark">
                    <span className="font-semibold text-slate-dark/90">{exp.company}</span>
                    {exp.location && ` &bull; ${exp.location}`}
                    {exp.employmentType && ` &bull; ${exp.employmentType}`}
                  </p>
                  {exp.description && (
                    <p className="font-serif text-xs text-slate-dark/75 line-clamp-2 max-w-2xl pt-0.5 leading-relaxed">
                      {exp.description}
                    </p>
                  )}
                </div>

                <div className="shrink-0 flex items-center gap-3">
                  <span className="font-gothic text-xs font-semibold uppercase tracking-wider text-cloud-dark tabular-nums">
                    {exp.startDate} &mdash; {exp.currentlyWorking ? "Present" : exp.endDate || "Present"}
                  </span>
                  <Link
                    to={`/career/experience/${exp.id}/edit`}
                    className="p-2 rounded-xl text-cloud-dark hover:text-slate-dark hover:bg-stone/20 transition-colors"
                    title="Edit role"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center space-y-3">
            <p className="font-serif text-sm text-cloud-dark max-w-md mx-auto">
              No professional roles recorded yet. Adding your career history gives curators and collaborators full visibility into your practice.
            </p>
            <Link
              to="/career/experience/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-stone bg-ivory-light hover:border-slate-dark font-gothic text-xs font-bold uppercase tracking-wider text-slate-dark transition-all text-decoration-none"
            >
              <Plus className="w-3.5 h-3.5 text-clay" />
              <span>Add Your First Role</span>
            </Link>
          </div>
        )}
      </section>
    </div>
  );
};
