import { GraduationCap } from "lucide-react";
import React from "react";
import { apiClient } from "@shared/api/apiClient.ts";
import type { CareerAcademic } from "@shared/types/index.ts";
import {
  AcademicCard,
  AcademicModal,
  CareerEmptyState,
  CareerHeader,
  DeleteConfirmModal,
} from "../components/index.ts";
import { useCareerCrud } from "../hooks/index.ts";

export const CareerAcademicsPage: React.FC = () => {
  const {
    items: academics,
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
  } = useCareerCrud<CareerAcademic>({
    loadFn: apiClient.getAcademics,
    createFn: apiClient.createAcademic,
    updateFn: apiClient.updateAcademic,
    deleteFn: apiClient.deleteAcademic,
    entityLabel: "Academic record",
    messages: {
      loadError: "Failed to load academic records",
      createSuccess: "Academic record added",
      updateSuccess: "Academic record updated",
      saveError: "Failed to save academic record",
      deleteSuccess: "Academic record expunged",
      deleteError: "Failed to expunge academic record",
    },
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <CareerHeader
        sectionTitle="Academics"
        description="Formal academic degrees, architectural qualifications, and scholarly research theses."
        actionLabel="Add Degree"
        onAction={openCreate}
      />

      {loading ? (
        <div className="py-20 text-center text-[#87867f] font-serif">
          Curating academic credentials...
        </div>
      ) : academics.length === 0 ? (
        <CareerEmptyState
          icon={GraduationCap}
          title="No Academic Records"
          description="Your scholarly history has not yet been cataloged. Record your degrees and research programs to showcase your foundation."
          actionLabel="Record Degree"
          onAction={openCreate}
        />
      ) : (
        <div className="space-y-6">
          {academics.map((acad) => (
            <AcademicCard
              key={acad.id}
              item={acad}
              onEdit={openEdit}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      <AcademicModal
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
        title="Expunge Academic Record"
        itemName={deleteTarget?.degree || "this degree"}
        isDeleting={isDeleting}
      />
    </div>
  );
};
