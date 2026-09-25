import { Sparkles } from "lucide-react";
import React, { useState } from "react";
import { apiClient } from "@shared/api/apiClient.ts";
import type { CareerSkill } from "@shared/types/index.ts";
import {
  CareerEmptyState,
  CareerHeader,
  DeleteConfirmModal,
  SkillCard,
  SkillModal,
} from "../components/index.ts";
import { useCareerCrud } from "../hooks/index.ts";

export const CareerSkillsPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const {
    items: skills,
    loading,
    modalOpen,
    editingItem,
    isSaving,
    deleteTarget,
    isDeleting,
    openCreate,
    openEdit,
    closeModal,
    setDeleteTarget,
    handleSave,
    handleDeleteConfirm,
  } = useCareerCrud<CareerSkill>({
    loadFn: apiClient.getSkills,
    createFn: apiClient.createSkill,
    updateFn: apiClient.updateSkill,
    deleteFn: apiClient.deleteSkill,
    entityLabel: "Skill",
    messages: {
      loadError: "Failed to load skills",
      createSuccess: "Skill cataloged",
      updateSuccess: "Skill updated",
      saveError: "Failed to save skill",
      deleteSuccess: "Skill expunged",
      deleteError: "Failed to expunge skill",
    },
  });

  const categories = [
    "All",
    ...Array.from(new Set(skills.map((s) => s.category || "General").filter(Boolean))),
  ];

  const filteredSkills =
    activeCategory === "All"
      ? skills
      : skills.filter((s) => (s.category || "General") === activeCategory);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <CareerHeader
        sectionTitle="Skills & Masteries"
        description="Comprehensive taxonomy of design methodologies, drafting tools, and architectural software capabilities."
        actionLabel="Catalog Skill"
        onAction={openCreate}
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
                  ? "bg-[#141413] text-[#faf9f5] border-[#141413]"
                  : "bg-[#faf9f5] text-[#87867f] border-[#cccbc8]/60 hover:text-[#141413] hover:border-[#141413]"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="py-20 text-center text-[#87867f] font-serif">
          Curating competency catalog...
        </div>
      ) : filteredSkills.length === 0 ? (
        <CareerEmptyState
          icon={Sparkles}
          title={activeCategory === "All" ? "No Skills Cataloged" : `No ${activeCategory} Skills`}
          description={
            activeCategory === "All"
              ? "Your competency index is empty. Catalog your technical, design, and tool masteries to display your capabilities."
              : `No skills found under the "${activeCategory}" classification. You can catalog new skills or switch category filters.`
          }
          actionLabel="Catalog Skill"
          onAction={openCreate}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredSkills.map((skill) => (
            <SkillCard
              key={skill.id}
              item={skill}
              onEdit={openEdit}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      <SkillModal
        isOpen={modalOpen}
        onClose={closeModal}
        onSave={handleSave}
        initialData={editingItem}
        isSaving={isSaving}
      />

      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Expunge Skill"
        itemName={deleteTarget?.name || "this skill"}
        isDeleting={isDeleting}
      />
    </div>
  );
};
