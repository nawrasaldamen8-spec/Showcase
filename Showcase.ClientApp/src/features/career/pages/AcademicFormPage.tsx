import { GraduationCap } from "lucide-react";
import React from "react";
import { apiClient } from "@shared/api/apiClient.ts";
import type { CareerAcademic } from "@shared/types/index.ts";
import { AcademicForm } from "../components/AcademicForm.tsx";
import { CareerActionLayout } from "../components/CareerActionLayout.tsx";
import { useCareerForm } from "../hooks/useCareerForm.ts";

export const AcademicFormPage: React.FC = () => {
  const { isEditing, isLoading, isSaving, item, handleSave, handleCancel } =
    useCareerForm<CareerAcademic>({
      loadAllFn: apiClient.getAcademics,
      createFn: apiClient.createAcademic,
      updateFn: apiClient.updateAcademic,
      listPath: "/career/academics",
      entityLabel: "Education Record",
    });

  if (isLoading) {
    return (
      <CareerActionLayout
        title={isEditing ? "Edit Education" : "Add Education"}
        subtitle="Add your degree, institution, and study details."
        backTo="/career/academics"
        backLabel="Back to Academics"
        icon={GraduationCap}
      >
        <div className="py-12 text-center text-cloud-dark font-serif">
          Loading education record...
        </div>
      </CareerActionLayout>
    );
  }

  return (
    <CareerActionLayout
      title={isEditing ? "Edit Education" : "Add Education"}
      subtitle="Add your degree, institution, and study details."
      backTo="/career/academics"
      backLabel="Back to Academics"
      icon={GraduationCap}
    >
      <AcademicForm
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
