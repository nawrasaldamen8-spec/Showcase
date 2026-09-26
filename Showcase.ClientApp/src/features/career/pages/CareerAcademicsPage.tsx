import { GraduationCap } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "@shared/api/apiClient.ts";
import type { CareerAcademic } from "@shared/types/index.ts";
import {
  AcademicCard,
  CareerEmptyState,
  CareerHeader,
  DeleteConfirmModal,
} from "../components/index.ts";
import { useCareerCrud, useCareerVisibility } from "../hooks/index.ts";

export const CareerAcademicsPage: React.FC = () => {
  const navigate = useNavigate();
  const { visibility, isToggling, toggleSection } = useCareerVisibility();
  const {
    items: academics,
    loading,
    deleteTarget,
    isDeleting,
    setDeleteTarget,
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
      deleteSuccess: "Education record deleted",
      deleteError: "Failed to delete education record",
    },
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <CareerHeader
        sectionTitle="Academics"
        description="Degrees, diplomas, and academic background."
        actionLabel="Add Education"
        onAction={() => navigate("/career/academics/new")}
        showVisibilityToggle={true}
        isVisibleInProfile={visibility.academics}
        onToggleVisibility={(val) => toggleSection("academics", val)}
        isTogglingVisibility={isToggling}
      />

      {loading ? (
        <div className="py-20 text-center text-[#87867f] font-serif">
          Loading education records...
        </div>
      ) : academics.length === 0 ? (
        <CareerEmptyState
          icon={GraduationCap}
          title="No Education Records"
          description="Add your degrees, diplomas, or study programs to showcase your education background."
          actionLabel="Add Education"
          onAction={() => navigate("/career/academics/new")}
        />
      ) : (
        <div className="space-y-6">
          {academics.map((acad) => (
            <AcademicCard
              key={acad.id}
              item={acad}
              onEdit={(item) => navigate(`/career/academics/${item.id}/edit`)}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Education Record"
        itemName={deleteTarget?.degree || "this degree"}
        isDeleting={isDeleting}
      />
    </div>
  );
};
