import { Award } from "lucide-react";
import React from "react";
import { apiClient } from "@shared/api/apiClient.ts";
import type { CareerCredential } from "@shared/types/index.ts";
import { CareerActionLayout } from "../components/CareerActionLayout.tsx";
import { CredentialForm } from "../components/CredentialForm.tsx";
import { useCareerForm } from "../hooks/useCareerForm.ts";

export const CredentialFormPage: React.FC = () => {
  const { isEditing, isLoading, isSaving, item, handleSave, handleCancel } =
    useCareerForm<CareerCredential>({
      loadAllFn: apiClient.getCredentials,
      createFn: apiClient.createCredential,
      updateFn: apiClient.updateCredential,
      listPath: "/career/credentials",
      entityLabel: "Certification",
    });

  if (isLoading) {
    return (
      <CareerActionLayout
        title={isEditing ? "Edit Certification" : "Add Certification"}
        subtitle="Add details about your certification or license."
        backTo="/career/credentials"
        backLabel="Back to Credentials"
        icon={Award}
      >
        <div className="py-12 text-center text-cloud-dark font-serif">
          Loading certification details...
        </div>
      </CareerActionLayout>
    );
  }

  return (
    <CareerActionLayout
      title={isEditing ? "Edit Certification" : "Add Certification"}
      subtitle="Add details about your certification or license."
      backTo="/career/credentials"
      backLabel="Back to Credentials"
      icon={Award}
    >
      <CredentialForm
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
