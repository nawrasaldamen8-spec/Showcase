import { Sparkles } from "lucide-react";
import React from "react";
import { apiClient } from "@shared/api/apiClient.ts";
import type { CareerSkill } from "@shared/types/index.ts";
import { CareerActionLayout } from "../components/CareerActionLayout.tsx";
import { SkillForm } from "../components/SkillForm.tsx";
import { useCareerForm } from "../hooks/useCareerForm.ts";

export const SkillFormPage: React.FC = () => {
  const { isEditing, isLoading, isSaving, item, handleSave, handleCancel } =
    useCareerForm<CareerSkill>({
      loadAllFn: apiClient.getSkills,
      createFn: apiClient.createSkill,
      updateFn: apiClient.updateSkill,
      listPath: "/career/skills",
      entityLabel: "Skill",
    });

  if (isLoading) {
    return (
      <CareerActionLayout
        title={isEditing ? "Edit Skill" : "Add Skill"}
        subtitle="Add a skill, tool, or area of expertise."
        backTo="/career/skills"
        backLabel="Back to Skills"
        icon={Sparkles}
      >
        <div className="py-12 text-center text-cloud-dark font-serif">
          Loading skill details...
        </div>
      </CareerActionLayout>
    );
  }

  return (
    <CareerActionLayout
      title={isEditing ? "Edit Skill" : "Add Skill"}
      subtitle="Add a skill, tool, or area of expertise."
      backTo="/career/skills"
      backLabel="Back to Skills"
      icon={Sparkles}
    >
      <SkillForm
        key={item?.id || "new"}
        initialItem={item}
        isEditing={isEditing}
        isSaving={isSaving}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </CareerActionLayout>
  );
};
