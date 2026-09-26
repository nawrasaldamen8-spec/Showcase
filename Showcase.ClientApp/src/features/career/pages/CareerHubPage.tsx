import {
  ArrowLeft,
  Award,
  Briefcase,
  Globe,
  GraduationCap,
  Sparkles,
  Trophy,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiClient } from "@shared/api/apiClient.ts";
import type { CareerSummary } from "@shared/types/index.ts";
import { CareerNavCard } from "../components/CareerNavCard.tsx";

export const CareerHubPage: React.FC = () => {
  const [summary, setSummary] = useState<CareerSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function loadSummary() {
      try {
        const data = await apiClient.getCareerSummary();
        if (mounted) {
          setSummary(data);
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to load career summary", err);
        if (mounted) setLoading(false);
      }
    }
    loadSummary();
    return () => {
      mounted = false;
    };
  }, []);

  const sections = [
    {
      title: "Experience",
      count: summary?.experienceCount ?? 0,
      countLabel: "roles",
      description: "Work history, roles, and professional achievements.",
      to: "/career/experience",
      icon: Briefcase,
    },
    {
      title: "Academics",
      count: summary?.academicsCount ?? 0,
      countLabel: "qualifications",
      description: "Degrees, diplomas, and academic background.",
      to: "/career/academics",
      icon: GraduationCap,
    },
    {
      title: "Skills",
      count: summary?.skillsCount ?? 0,
      countLabel: "skills",
      description: "Key skills, technical competencies, and proficiencies.",
      to: "/career/skills",
      icon: Sparkles,
    },
    {
      title: "Credentials",
      count: summary?.credentialsCount ?? 0,
      countLabel: "certifications",
      description: "Professional licenses, certifications, and accreditations.",
      to: "/career/credentials",
      icon: Award,
    },
    {
      title: "Languages",
      count: summary?.languagesCount ?? 0,
      countLabel: "languages",
      description: "Languages and proficiency levels.",
      to: "/career/languages",
      icon: Globe,
    },
    {
      title: "Achievements",
      count: summary?.achievementsCount ?? 0,
      countLabel: "awards",
      description: "Honors, awards, publications, and key milestones.",
      to: "/career/achievements",
      icon: Trophy,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Editorial Breadcrumb Navigation */}
      <nav className="mb-6" aria-label="Breadcrumb navigation">
        <Link
          to="/studio"
          className="inline-flex items-center gap-2 font-gothic text-xs font-semibold uppercase tracking-[0.14em] text-[#87867f] hover:text-[#141413] transition-colors group text-decoration-none"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span>Studio</span>
        </Link>
      </nav>

      {/* Overview Header */}
      <div className="mb-10 sm:mb-12 border-b border-[#cccbc8]/60 pb-8">
        <span className="font-gothic text-[11px] font-bold uppercase tracking-[0.2em] text-[#87867f] block mb-2">
          Professional Profile &bull; Overview
        </span>
        <h1 className="font-gothic text-3xl sm:text-4xl lg:text-5xl font-extrabold uppercase tracking-tight text-[#141413]">
          Career Hub
        </h1>
        <p className="font-serif text-[16px] sm:text-[18px] text-[#141413]/70 mt-3 max-w-2xl leading-relaxed">
          Manage your work history, education, skills, certifications, and achievements.
        </p>
      </div>

      {/* Grid of 6 Category Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
