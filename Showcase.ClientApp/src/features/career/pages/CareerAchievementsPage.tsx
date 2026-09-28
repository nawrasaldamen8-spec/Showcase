import { Trophy } from "lucide-react";
import React from "react";
import { apiClient } from "@shared/api/apiClient.ts";
import type { CareerAchievement } from "@shared/types/index.ts";
import { AchievementCard, CareerListPage } from "../components/index.ts";

export const CareerAchievementsPage: React.FC = () => {
  return (
    <CareerListPage<CareerAchievement>
      sectionKey="achievements"
      sectionTitle="Achievements"
      description="Honors, awards, publications, and key career milestones."
      actionLabel="Add Achievement"
      newRoute="/career/achievements/new"
      editRoute={(id) => `/career/achievements/${id}/edit`}
      loadFn={apiClient.getAchievements}
      deleteFn={apiClient.deleteAchievement}
      entityLabel="Achievement"
      emptyIcon={Trophy}
      emptyTitle="No Achievements Added"
      emptyDescription="Highlight your honors, awards, publications, or key achievements."
      getItemName={(a) => a.title}
      renderCard={(item, onEdit, onDelete) => (
        <AchievementCard key={item.id} item={item} onEdit={onEdit} onDelete={onDelete} />
      )}
    />
  );
};
