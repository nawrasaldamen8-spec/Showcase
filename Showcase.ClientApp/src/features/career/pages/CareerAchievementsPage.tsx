import { Trophy } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "@shared/api/apiClient.ts";
import type { CareerAchievement } from "@shared/types/index.ts";
import {
  AchievementCard,
  CareerEmptyState,
  CareerHeader,
  DeleteConfirmModal,
} from "../components/index.ts";
import { useCareerCrud, useCareerVisibility } from "../hooks/index.ts";

export const CareerAchievementsPage: React.FC = () => {
  const navigate = useNavigate();
  const { visibility, isToggling, toggleSection } = useCareerVisibility();
  const {
    items: achievements,
    loading,
    deleteTarget,
    isDeleting,
    setDeleteTarget,
    handleDeleteConfirm,
  } = useCareerCrud<CareerAchievement>({
    loadFn: apiClient.getAchievements,
    createFn: apiClient.createAchievement,
    updateFn: apiClient.updateAchievement,
    deleteFn: apiClient.deleteAchievement,
    entityLabel: "Achievement",
    messages: {
      loadError: "Failed to load achievements",
      createSuccess: "Achievement added successfully",
      updateSuccess: "Achievement updated",
      saveError: "Failed to save achievement",
      deleteSuccess: "Achievement deleted successfully",
      deleteError: "Failed to delete achievement",
    },
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <CareerHeader
        sectionTitle="Achievements"
        description="Honors, awards, publications, and key career milestones."
        actionLabel="Add Achievement"
        onAction={() => navigate("/career/achievements/new")}
        showVisibilityToggle={true}
        isVisibleInProfile={visibility.achievements}
        onToggleVisibility={(val) => toggleSection("achievements", val)}
        isTogglingVisibility={isToggling}
      />

      {loading ? (
        <div className="py-20 text-center text-[#87867f] font-serif">
          Loading achievements...
        </div>
      ) : achievements.length === 0 ? (
        <CareerEmptyState
          icon={Trophy}
          title="No Achievements Added"
          description="Highlight your honors, awards, publications, or key achievements."
          actionLabel="Add Achievement"
          onAction={() => navigate("/career/achievements/new")}
        />
      ) : (
        <div className="space-y-6">
          {achievements.map((ach) => (
            <AchievementCard
              key={ach.id}
              item={ach}
              onEdit={(item) => navigate(`/career/achievements/${item.id}/edit`)}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Achievement"
        itemName={deleteTarget?.title || "this distinction"}
        isDeleting={isDeleting}
      />
    </div>
  );
};
