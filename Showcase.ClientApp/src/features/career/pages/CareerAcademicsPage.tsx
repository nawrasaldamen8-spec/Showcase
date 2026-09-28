import { GraduationCap } from "lucide-react";
import React from "react";
import { apiClient } from "@shared/api/apiClient.ts";
import type { CareerAcademic } from "@shared/types/index.ts";
import { AcademicCard, CareerListPage } from "../components/index.ts";

export const CareerAcademicsPage: React.FC = () => {
  return (
    <CareerListPage<CareerAcademic>
      sectionKey="academics"
      sectionTitle="Academics"
      description="Degrees, diplomas, and academic background."
      actionLabel="Add Education"
      newRoute="/career/academics/new"
      editRoute={(id) => `/career/academics/${id}/edit`}
      loadFn={apiClient.getAcademics}
      deleteFn={apiClient.deleteAcademic}
      entityLabel="Education Record"
      emptyIcon={GraduationCap}
      emptyTitle="No Education Records"
      emptyDescription="Add your degrees, diplomas, or study programs to showcase your education background."
      getItemName={(a) => a.degree}
      renderCard={(item, onEdit, onDelete) => (
        <AcademicCard key={item.id} item={item} onEdit={onEdit} onDelete={onDelete} />
      )}
    />
  );
};
