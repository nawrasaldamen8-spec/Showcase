import { Briefcase } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "@shared/api/apiClient.ts";
import type { CareerExperience } from "@shared/types/index.ts";
import {
  CareerEmptyState,
  CareerHeader,
  DeleteConfirmModal,
  ExperienceCard,
} from "../components/index.ts";
import { useCareerCrud, useCareerVisibility } from "../hooks/index.ts";

export const CareerExperiencePage: React.FC = () => {
  const navigate = useNavigate();
  const { visibility, isToggling, toggleSection } = useCareerVisibility();
  const {
    items: experiences,
    loading,
    deleteTarget,
    isDeleting,
    setDeleteTarget,
    handleDeleteConfirm,
  } = useCareerCrud<CareerExperience>({
    loadFn: apiClient.getExperiences,
    createFn: apiClient.createExperience,
    updateFn: apiClient.updateExperience,
    deleteFn: apiClient.deleteExperience,
    entityLabel: "Experience",
    messages: {
      loadError: "Failed to load experience records",
      createSuccess: "Experience added successfully",
      updateSuccess: "Experience updated successfully",
      saveError: "Failed to save experience",
      deleteSuccess: "Experience deleted successfully",
      deleteError: "Failed to delete experience",
    },
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <CareerHeader
        sectionTitle="Experience"
        description="Your work history and professional roles."
        actionLabel="Add Experience"
        onAction={() => navigate("/career/experience/new")}
        showVisibilityToggle={true}
        isVisibleInProfile={visibility.experience}
        onToggleVisibility={(val) => toggleSection("experience", val)}
        isTogglingVisibility={isToggling}
      />

      {loading ? (
        <div className="py-20 text-center text-[#87867f] font-serif">
          Loading experience records...
        </div>
      ) : experiences.length === 0 ? (
        <CareerEmptyState
          icon={Briefcase}
          title="No Experience Added"
          description="Share your work history and current or previous roles."
          actionLabel="Add Experience"
          onAction={() => navigate("/career/experience/new")}
        />
      ) : (
        <div className="space-y-6">
          {experiences.map((exp) => (
            <ExperienceCard
              key={exp.id}
              item={exp}
              onEdit={(item) => navigate(`/career/experience/${item.id}/edit`)}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Experience"
        itemName={deleteTarget?.jobTitle || "this position"}
        isDeleting={isDeleting}
      />
    </div>
  );
};
