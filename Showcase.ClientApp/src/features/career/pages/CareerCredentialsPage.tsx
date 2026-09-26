import { Award } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "@shared/api/apiClient.ts";
import type { CareerCredential } from "@shared/types/index.ts";
import {
  CareerEmptyState,
  CareerHeader,
  CredentialCard,
  DeleteConfirmModal,
} from "../components/index.ts";
import { useCareerCrud, useCareerVisibility } from "../hooks/index.ts";

export const CareerCredentialsPage: React.FC = () => {
  const navigate = useNavigate();
  const { visibility, isToggling, toggleSection } = useCareerVisibility();
  const {
    items: credentials,
    loading,
    deleteTarget,
    isDeleting,
    setDeleteTarget,
    handleDeleteConfirm,
  } = useCareerCrud<CareerCredential>({
    loadFn: apiClient.getCredentials,
    createFn: apiClient.createCredential,
    updateFn: apiClient.updateCredential,
    deleteFn: apiClient.deleteCredential,
    entityLabel: "Credential",
    messages: {
      loadError: "Failed to load credentials",
      createSuccess: "Credential added",
      updateSuccess: "Credential updated",
      saveError: "Failed to save credential",
      deleteSuccess: "Certification deleted",
      deleteError: "Failed to delete certification",
    },
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <CareerHeader
        sectionTitle="Certifications & Licenses"
        description="Certificates, licenses, and professional accreditations."
        actionLabel="Add Certification"
        onAction={() => navigate("/career/credentials/new")}
        showVisibilityToggle={true}
        isVisibleInProfile={visibility.credentials}
        onToggleVisibility={(val) => toggleSection("credentials", val)}
        isTogglingVisibility={isToggling}
      />

      {loading ? (
        <div className="py-20 text-center text-[#87867f] font-serif">
          Loading certifications...
        </div>
      ) : credentials.length === 0 ? (
        <CareerEmptyState
          icon={Award}
          title="No Certifications Added"
          description="Add your professional certifications, licenses, and course completions."
          actionLabel="Add Certification"
          onAction={() => navigate("/career/credentials/new")}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {credentials.map((cred) => (
            <CredentialCard
              key={cred.id}
              item={cred}
              onEdit={(item) => navigate(`/career/credentials/${item.id}/edit`)}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Certification"
        itemName={deleteTarget?.name || "this credential"}
        isDeleting={isDeleting}
      />
    </div>
  );
};
