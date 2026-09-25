import { Briefcase } from "lucide-react";
import React from "react";
import { apiClient } from "@shared/api/apiClient.ts";
import type { CareerExperience } from "@shared/types/index.ts";
import {
  CareerEmptyState,
  CareerHeader,
  DeleteConfirmModal,
  ExperienceCard,
  ExperienceModal,
} from "../components/index.ts";
import { useCareerCrud } from "../hooks/index.ts";

export const CareerExperiencePage: React.FC = () => {
  const {
    items: experiences,
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
  } = useCareerCrud<CareerExperience>({
    loadFn: apiClient.getExperiences,
    createFn: apiClient.createExperience,
    updateFn: apiClient.updateExperience,
    deleteFn: apiClient.deleteExperience,
    entityLabel: "Position",
    messages: {
      loadError: "Failed to load experience records",
      createSuccess: "Position recorded successfully",
      updateSuccess: "Position updated successfully",
      saveError: "Failed to save experience position",
      deleteSuccess: "Position expunged successfully",
      deleteError: "Failed to expunge position",
    },
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <CareerHeader
        sectionTitle="Experience"
        description="Chronological record of directorial engagements, studio collaborations, and spatial design roles."
        actionLabel="Add Position"
        onAction={openCreate}
      />

      {loading ? (
        <div className="py-20 text-center text-[#87867f] font-serif">
          Curating chronological records...
        </div>
      ) : experiences.length === 0 ? (
        <CareerEmptyState
          icon={Briefcase}
          title="No Experience Recorded"
          description="Your professional timeline has not yet been documented. Add your current and previous studio positions to showcase your trajectory."
          actionLabel="Record First Position"
          onAction={openCreate}
        />
      ) : (
        <div className="space-y-6">
          {experiences.map((exp) => (
            <ExperienceCard
              key={exp.id}
              item={exp}
              onEdit={openEdit}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      <ExperienceModal
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
        title="Expunge Position"
        itemName={deleteTarget?.jobTitle || "this position"}
        isDeleting={isDeleting}
      />
    </div>
  );
};
