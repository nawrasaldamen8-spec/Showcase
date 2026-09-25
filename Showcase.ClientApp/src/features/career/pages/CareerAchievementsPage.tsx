import { Trophy } from "lucide-react";
import React from "react";
import { apiClient } from "@shared/api/apiClient.ts";
import type { CareerAchievement } from "@shared/types/index.ts";
import {
  AchievementCard,
  AchievementModal,
  CareerEmptyState,
  CareerHeader,
  DeleteConfirmModal,
} from "../components/index.ts";
import { useCareerCrud } from "../hooks/index.ts";

export const CareerAchievementsPage: React.FC = () => {
  const {
    items: achievements,
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
  } = useCareerCrud<CareerAchievement>({
    loadFn: apiClient.getAchievements,
    createFn: apiClient.createAchievement,
    updateFn: apiClient.updateAchievement,
    deleteFn: apiClient.deleteAchievement,
    entityLabel: "Achievement",
    messages: {
      loadError: "Failed to load achievements",
      createSuccess: "Achievement recorded",
      updateSuccess: "Achievement updated",
      saveError: "Failed to save achievement",
      deleteSuccess: "Achievement expunged",
      deleteError: "Failed to expunge achievement",
    },
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <CareerHeader
        sectionTitle="Achievements"
        description="International design awards, published monographs, juried exhibitions, and career milestones."
        actionLabel="Add Achievement"
        onAction={openCreate}
      />

      {loading ? (
        <div className="py-20 text-center text-[#87867f] font-serif">
          Curating honors and milestones...
        </div>
      ) : achievements.length === 0 ? (
        <CareerEmptyState
          icon={Trophy}
          title="No Achievements Recorded"
          description="Your distinctions chronicle is empty. Record your design awards, monographs, or gallery retrospectives."
          actionLabel="Add Achievement"
          onAction={openCreate}
        />
      ) : (
        <div className="space-y-6">
          {achievements.map((ach) => (
            <AchievementCard
              key={ach.id}
              item={ach}
              onEdit={openEdit}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      <AchievementModal
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
        title="Expunge Achievement"
        itemName={deleteTarget?.title || "this distinction"}
        isDeleting={isDeleting}
      />
    </div>
  );
};
