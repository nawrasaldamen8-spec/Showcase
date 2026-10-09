import {
  Award,
  Briefcase,
  Globe,
  GraduationCap,
  Sparkles,
  Trophy,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { apiClient } from "@shared/api/apiClient.ts";
import type { CareerSummary } from "@shared/types/index.ts";
import { CareerNavCard } from "../components/CareerNavCard.tsx";

export const CareerHubPage: React.FC = () => {
  const [summary, setSummary] = useState<CareerSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        const summaryData = await apiClient.getCareerSummary().catch(() => null);
        if (mounted) {
          if (summaryData) setSummary(summaryData);
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
      {/* Overview Header */}
      <div className="border-b border-stone/60 pb-6 sm:pb-8">
        <h1 className="font-gothic text-3xl sm:text-4xl lg:text-5xl font-extrabold uppercase tracking-tight text-slate-dark">
          Career Hub
        </h1>
        <p className="font-serif text-sm sm:text-base text-slate-dark/70 mt-2 max-w-2xl leading-relaxed">
          Record your verified employment history, academic credentials, and design accolades.
        </p>
      </div>

      {/* Grid of 6 Category Navigation Cards */}
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
    </div>
  );
};

