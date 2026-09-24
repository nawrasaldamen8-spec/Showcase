import { Globe, Pencil, Trash2 } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { apiClient } from "../../../shared/api/apiClient.ts";
import { useToast } from "../../../shared/context/index.ts";
import type { CareerLanguage } from "../../../shared/types/index.ts";
import {
  CareerEmptyState,
  CareerHeader,
  DeleteConfirmModal,
  LanguageModal,
} from "../components/index.ts";

export const CareerLanguagesPage: React.FC = () => {
  const [languages, setLanguages] = useState<CareerLanguage[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CareerLanguage | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CareerLanguage | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { showToast } = useToast();

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiClient.getLanguages();
      setLanguages(data);
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to load languages");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    let isCancelled = false;

    void Promise.resolve().then(async () => {
      if (isCancelled) return;
      await loadItems();
    });

    return () => {
      isCancelled = true;
    };
  }, [loadItems]);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (item: CareerLanguage) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleSave = async (data: Omit<CareerLanguage, "id" | "createdAt">) => {
    try {
      setIsSaving(true);
      if (editingItem) {
        await apiClient.updateLanguage(editingItem.id, data);
        showToast("success", "Language updated");
      } else {
        await apiClient.createLanguage(data);
        showToast("success", "Language recorded");
      }
      setModalOpen(false);
      setEditingItem(null);
      await loadItems();
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to save language");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await apiClient.deleteLanguage(deleteTarget.id);
      showToast("success", "Language expunged");
      setDeleteTarget(null);
      await loadItems();
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to expunge language");
    } finally {
      setIsDeleting(false);
    }
  };

  const getProficiencyPercentage = (proficiency: string) => {
    switch (proficiency.toLowerCase()) {
      case "native":
        return 100;
      case "fluent":
        return 85;
      case "professional":
        return 70;
      case "intermediate":
        return 50;
      case "basic":
        return 25;
      default:
        return 60;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <CareerHeader
        sectionTitle="Languages"
        description="Linguistic competencies, native dialects, and international conversational proficiencies."
        actionLabel="Add Language"
        onAction={handleOpenCreate}
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
          onAction={handleOpenCreate}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {languages.map((lang) => {
            const percent = getProficiencyPercentage(lang.proficiency);
            return (
              <div
                key={lang.id}
                className="p-5 sm:p-6 rounded-[24px] bg-[#faf9f5] border border-[#cccbc8]/60 hover:border-[#141413] transition-colors shadow-none"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <span className="font-gothic text-[10px] font-bold uppercase tracking-[0.16em] text-[#87867f] block">
                      Fluency
                    </span>
                    <h3 className="font-gothic text-xl font-bold uppercase tracking-tight text-[#141413]">
                      {lang.language}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(lang)}
                      className="p-1.5 rounded-lg text-[#87867f] hover:text-[#141413] hover:bg-[#f0eee6] transition-colors cursor-pointer"
                      aria-label={`Edit ${lang.language}`}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(lang)}
                      className="p-1.5 rounded-lg text-[#87867f] hover:text-red-600 hover:bg-red-50/40 transition-colors cursor-pointer"
                      aria-label={`Delete ${lang.language}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-gothic text-[11px] font-bold uppercase tracking-wider text-[#d97757]">
                    {lang.proficiency}
                  </span>
                  <span className="font-mono text-[11px] text-[#87867f]">{percent}%</span>
                </div>

                {/* Editorial Meter Bar */}
                <div className="w-full h-1.5 rounded-full bg-[#f0eee6] border border-[#cccbc8]/40 overflow-hidden">
                  <div
                    className="h-full bg-[#141413] rounded-full transition-all duration-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Language Modal */}
      <LanguageModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSave}
        initialData={editingItem}
        isSaving={isSaving}
      />

      {/* Delete Confirmation Modal */}
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
