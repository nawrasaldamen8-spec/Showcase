import { Globe } from "lucide-react";
import React from "react";
import { apiClient } from "@shared/api/apiClient.ts";
import type { CareerLanguage } from "@shared/types/index.ts";
import { CareerListPage, LanguageCard } from "../components/index.ts";

export const CareerLanguagesPage: React.FC = () => {
  return (
    <CareerListPage<CareerLanguage>
      sectionKey="languages"
      sectionTitle="Languages"
      description="Languages and proficiency levels."
      actionLabel="Add Language"
      newRoute="/career/languages/new"
      editRoute={(id) => `/career/languages/${id}/edit`}
      loadFn={apiClient.getLanguages}
      deleteFn={apiClient.deleteLanguage}
      entityLabel="Language"
      emptyIcon={Globe}
      emptyTitle="No Languages Added"
      emptyDescription="Add the languages you speak and your proficiency level."
      getItemName={(l) => l.language}
      gridClassName="grid grid-cols-1 sm:grid-cols-2 gap-4"
      renderCard={(item, onEdit, onDelete) => (
        <LanguageCard key={item.id} item={item} onEdit={onEdit} onDelete={onDelete} />
      )}
    />
  );
};
