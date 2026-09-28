import { Globe } from "lucide-react";
import React from "react";
import { apiClient } from "@shared/api/apiClient.ts";
import type { CareerLanguage } from "@shared/types/index.ts";
import { CareerActionLayout } from "../components/CareerActionLayout.tsx";
import { LanguageForm } from "../components/LanguageForm.tsx";
import { useCareerForm } from "../hooks/useCareerForm.ts";

export const LanguageFormPage: React.FC = () => {
  const { isEditing, isLoading, isSaving, item, handleSave, handleCancel } =
    useCareerForm<CareerLanguage>({
      loadAllFn: apiClient.getLanguages,
      createFn: apiClient.createLanguage,
      updateFn: apiClient.updateLanguage,
      listPath: "/career/languages",
      entityLabel: "Language",
    });

  if (isLoading) {
    return (
      <CareerActionLayout
        title={isEditing ? "Edit Language" : "Add Language"}
        subtitle="Add language and proficiency level."
        backTo="/career/languages"
        backLabel="Back to Languages"
        icon={Globe}
      >
        <div className="py-12 text-center text-cloud-dark font-serif">
          Loading language details...
        </div>
      </CareerActionLayout>
    );
  }

  return (
    <CareerActionLayout
      title={isEditing ? "Edit Language" : "Add Language"}
      subtitle="Add language and proficiency level."
      backTo="/career/languages"
      backLabel="Back to Languages"
      icon={Globe}
    >
      <LanguageForm
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
