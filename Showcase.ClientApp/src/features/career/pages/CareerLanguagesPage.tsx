import { Globe } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "@shared/api/apiClient.ts";
import type { CareerLanguage } from "@shared/types/index.ts";
import {
  CareerEmptyState,
  CareerHeader,
  DeleteConfirmModal,
  LanguageCard,
} from "../components/index.ts";
import { useCareerCrud, useCareerVisibility } from "../hooks/index.ts";

export const CareerLanguagesPage: React.FC = () => {
  const navigate = useNavigate();
  const { visibility, isToggling, toggleSection } = useCareerVisibility();
  const {
    items: languages,
    loading,
    deleteTarget,
    isDeleting,
    setDeleteTarget,
    handleDeleteConfirm,
  } = useCareerCrud<CareerLanguage>({
    loadFn: apiClient.getLanguages,
    createFn: apiClient.createLanguage,
    updateFn: apiClient.updateLanguage,
    deleteFn: apiClient.deleteLanguage,
    entityLabel: "Language",
    messages: {
      loadError: "Failed to load languages",
      createSuccess: "Language added successfully",
      updateSuccess: "Language updated",
      saveError: "Failed to save language",
      deleteSuccess: "Language deleted successfully",
      deleteError: "Failed to delete language",
    },
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <CareerHeader
        sectionTitle="Languages"
        description="Languages and proficiency levels."
        actionLabel="Add Language"
        onAction={() => navigate("/career/languages/new")}
        showVisibilityToggle={true}
        isVisibleInProfile={visibility.languages}
        onToggleVisibility={(val) => toggleSection("languages", val)}
        isTogglingVisibility={isToggling}
      />

      {loading ? (
        <div className="py-20 text-center text-[#87867f] font-serif">
          Loading languages...
        </div>
      ) : languages.length === 0 ? (
        <CareerEmptyState
          icon={Globe}
          title="No Languages Added"
          description="Add the languages you speak and your proficiency level."
          actionLabel="Add Language"
          onAction={() => navigate("/career/languages/new")}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {languages.map((lang) => (
            <LanguageCard
              key={lang.id}
              item={lang}
              onEdit={(item) => navigate(`/career/languages/${item.id}/edit`)}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Language"
        itemName={deleteTarget?.language || "this language"}
        isDeleting={isDeleting}
      />
    </div>
  );
};
