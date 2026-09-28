import { Briefcase } from "lucide-react";
import React from "react";
import { apiClient } from "@shared/api/apiClient.ts";
import type { CareerExperience } from "@shared/types/index.ts";
import { CareerListPage, ExperienceCard } from "../components/index.ts";

export const CareerExperiencePage: React.FC = () => {
  return (
    <CareerListPage<CareerExperience>
      sectionKey="experience"
      sectionTitle="Experience"
      description="Your work history and professional roles."
      actionLabel="Add Experience"
      newRoute="/career/experience/new"
      editRoute={(id) => `/career/experience/${id}/edit`}
      loadFn={apiClient.getExperiences}
      deleteFn={apiClient.deleteExperience}
      entityLabel="Experience"
      emptyIcon={Briefcase}
      emptyTitle="No Experience Added"
      emptyDescription="Share your work history and current or previous roles."
      getItemName={(e) => e.jobTitle}
      renderCard={(item, onEdit, onDelete) => (
        <ExperienceCard key={item.id} item={item} onEdit={onEdit} onDelete={onDelete} />
      )}
    />
  );
};
