import { Sparkles } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient, extractApiErrorMessage, queryKeys } from "@shared/api/index.ts";
import type { CareerSkill } from "@shared/types/index.ts";
import {
  CareerEmptyState,
  CareerHeader,
  DeleteConfirmModal,
  SkillCard,
} from "../components/index.ts";
import { useCareerVisibility } from "../hooks/index.ts";

export const CareerSkillsPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [deleteTarget, setDeleteTarget] = useState<CareerSkill | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const { data: skills = [], isLoading: loading } = useQuery<CareerSkill[]>({
    queryKey: queryKeys.career.skills(),
    queryFn: () => apiClient.getSkills(),
  });

  const { visibility, isToggling, toggleSection } = useCareerVisibility();

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await apiClient.deleteSkill(deleteTarget.id);
      queryClient.invalidateQueries({ queryKey: queryKeys.career.skills() });
      toast.success("Skill removed.");
      setDeleteTarget(null);
    } catch (err: unknown) {
      toast.error(extractApiErrorMessage(err, "Failed to delete skill."));
    } finally {
      setIsDeleting(false);
    }
  };

  const categories = [
    "All",
    ...Array.from(new Set(skills.map((s: CareerSkill) => s.category || "General").filter(Boolean))),
  ];

  const filteredSkills =
    activeCategory === "All"
      ? skills
      : skills.filter((s: CareerSkill) => (s.category || "General") === activeCategory);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <CareerHeader
        sectionTitle="Skills"
        description="Highlight your technical proficiencies, tools, and methodologies."
        actionLabel="Add Skill"
        onAction={() => navigate("/career/skills/new")}
        showVisibilityToggle={true}
        isVisibleInProfile={visibility.skills}
        onToggleVisibility={(val) => toggleSection("skills", val)}
        isTogglingVisibility={isToggling}
        itemCount={skills.length}
        maxCount={10}
      />

      {/* Category Filter Pills */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((cat) => {
          const isSelected = activeCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full font-gothic text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border ${
                isSelected
                  ? "bg-slate-dark text-ivory-light border-slate-dark"
                  : "bg-ivory-light text-cloud-dark border-stone/60 hover:text-slate-dark hover:border-slate-dark"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="py-20 text-center text-cloud-dark font-serif">
          Loading skills...
        </div>
      ) : filteredSkills.length === 0 ? (
        <CareerEmptyState
          icon={Sparkles}
          title={activeCategory === "All" ? "No Skills Added" : `No ${activeCategory} Skills`}
          description={
            activeCategory === "All"
              ? "Add your key skills, tools, and areas of expertise to display on your profile."
              : `No skills found under "${activeCategory}". Add a new skill or switch filters.`
          }
          actionLabel="Add Skill"
          onAction={() => navigate("/career/skills/new")}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredSkills.map((skill: CareerSkill) => (
            <SkillCard
              key={skill.id}
              item={skill}
              onEdit={(item) => navigate(`/career/skills/${item.id}/edit`)}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Skill"
        itemName={deleteTarget?.name || "this skill"}
        isDeleting={isDeleting}
      />
    </div>
  );
};
