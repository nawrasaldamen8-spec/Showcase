import { Globe } from "lucide-react";
import React from "react";
import { apiClient } from "@shared/api/apiClient.ts";
import type { CareerLanguage } from "@shared/types/index.ts";
import {
  CareerEmptyState,
  CareerHeader,
  DeleteConfirmModal,
  LanguageCard,
  LanguageModal,
} from "../components/index.ts";
import { useCareerCrud } from "../hooks/index.ts";

export const CareerLanguagesPage: React.FC = () => {
  const {
    items: languages,
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
  } = useCareerCrud<CareerLanguage>({
    loadFn: apiClient.getLanguages,
    createFn: apiClient.createLanguage,
    updateFn: apiClient.updateLanguage,
    deleteFn: apiClient.deleteLanguage,
    entityLabel: "Language",
    messages: {
      loadError: "Failed to load languages",
      createSuccess: "Language recorded",
      updateSuccess: "Language updated",
      saveError: "Failed to save language",
      deleteSuccess: "Language expunged",
      deleteError: "Failed to expunge language",
    },
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <CareerHeader
        sectionTitle="Languages"
        description="Linguistic competencies, native dialects, and international conversational proficiencies."
        actionLabel="Add Language"
        onAction={openCreate}
      />

      {loading ? (
        <div className="py-20 text-center text-[#87867f] font-serif">
          Curating linguistic index...
        </div>
      ) : languages.length === 0 ? (
        <CareerEmptyState
          icon={Globe}
          title="No Languages Cataloged"
          description="Your linguistic profile is currently empty. Record your spoken and written proficiencies to enrich your international portfolio."
          actionLabel="Add Language"
          onAction={openCreate}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {languages.map((lang) => (
            <LanguageCard
              key={lang.id}
              item={lang}
              onEdit={openEdit}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      <LanguageModal
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
        title="Expunge Language"
        itemName={deleteTarget?.language || "this language"}
        isDeleting={isDeleting}
      />
    </div>
  );
};
