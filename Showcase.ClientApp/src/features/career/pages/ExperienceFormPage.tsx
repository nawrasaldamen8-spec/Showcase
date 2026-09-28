import { Briefcase } from "lucide-react";
import React from "react";
import { apiClient } from "@shared/api/apiClient.ts";
import type { CareerExperience } from "@shared/types/index.ts";
import { CareerActionLayout } from "../components/CareerActionLayout.tsx";
import { ExperienceForm } from "../components/ExperienceForm.tsx";
import { useCareerForm } from "../hooks/useCareerForm.ts";

export const ExperienceFormPage: React.FC = () => {
  const { isEditing, isLoading, isSaving, item, handleSave, handleCancel } =
    useCareerForm<CareerExperience>({
      loadAllFn: apiClient.getExperiences,
      createFn: apiClient.createExperience,
      updateFn: apiClient.updateExperience,
      listPath: "/career/experience",
      entityLabel: "Experience",
    });

  if (isLoading) {
    return (
      <CareerActionLayout
        title={isEditing ? "Edit Experience" : "Add Experience"}
        subtitle="Add details about your role and responsibilities."
        backTo="/career/experience"
        backLabel="Back to Experience"
        icon={Briefcase}
      >
        <div className="py-12 text-center text-cloud-dark font-serif">
          Loading experience details...
        </div>
      </CareerActionLayout>
    );
  }

  return (
    <CareerActionLayout
      title={isEditing ? "Edit Experience" : "Add Experience"}
      subtitle="Add details about your role and responsibilities."
      backTo="/career/experience"
      backLabel="Back to Experience"
      icon={Briefcase}
    >
      <ExperienceForm
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
