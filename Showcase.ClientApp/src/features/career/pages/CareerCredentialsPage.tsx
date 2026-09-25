import { Award } from "lucide-react";
import React from "react";
import { apiClient } from "@shared/api/apiClient.ts";
import type { CareerCredential } from "@shared/types/index.ts";
import {
  CareerEmptyState,
  CareerHeader,
  CredentialCard,
  CredentialModal,
  DeleteConfirmModal,
} from "../components/index.ts";
import { useCareerCrud } from "../hooks/index.ts";

export const CareerCredentialsPage: React.FC = () => {
  const {
    items: credentials,
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
      deleteSuccess: "Credential expunged",
      deleteError: "Failed to expunge credential",
    },
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <CareerHeader
        sectionTitle="Credentials & Licenses"
        description="Professional board certifications, software masteries, and state architectural licenses."
        actionLabel="Add Credential"
        onAction={openCreate}
      />

      {loading ? (
        <div className="py-20 text-center text-[#87867f] font-serif">
          Curating professional certifications...
        </div>
      ) : credentials.length === 0 ? (
        <CareerEmptyState
          icon={Award}
          title="No Credentials Recorded"
          description="Your credentials catalog is empty. Add state licenses, specialized certifications, or professional verifications."
          actionLabel="Add Credential"
          onAction={openCreate}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {credentials.map((cred) => (
            <CredentialCard
              key={cred.id}
              item={cred}
              onEdit={openEdit}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      <CredentialModal
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
        title="Expunge Credential"
        itemName={deleteTarget?.name || "this credential"}
        isDeleting={isDeleting}
      />
    </div>
  );
};
