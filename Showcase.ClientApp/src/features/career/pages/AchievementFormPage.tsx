import { Trophy } from "lucide-react";
import React from "react";
import { apiClient } from "@shared/api/apiClient.ts";
import type { CareerAchievement } from "@shared/types/index.ts";
import { AchievementForm } from "../components/AchievementForm.tsx";
import { CareerActionLayout } from "../components/CareerActionLayout.tsx";
import { useCareerForm } from "../hooks/useCareerForm.ts";

export const AchievementFormPage: React.FC = () => {
  const { isEditing, isLoading, isSaving, item, handleSave, handleCancel } =
    useCareerForm<CareerAchievement>({
      loadAllFn: apiClient.getAchievements,
      createFn: apiClient.createAchievement,
      updateFn: apiClient.updateAchievement,
      listPath: "/career/achievements",
      entityLabel: "Achievement",
    });

  if (isLoading) {
    return (
      <CareerActionLayout
        title={isEditing ? "Edit Achievement" : "Add Achievement"}
        subtitle="Add honors, awards, publications, or key milestones."
        backTo="/career/achievements"
        backLabel="Back to Achievements"
        icon={Trophy}
      >
        <div className="py-12 text-center text-cloud-dark font-serif">
          Loading achievement details...
        </div>
      </CareerActionLayout>
    );
  }

  return (
    <CareerActionLayout
      title={isEditing ? "Edit Achievement" : "Add Achievement"}
      subtitle="Add honors, awards, publications, or key milestones."
      backTo="/career/achievements"
      backLabel="Back to Achievements"
      icon={Trophy}
    >
      <AchievementForm
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
