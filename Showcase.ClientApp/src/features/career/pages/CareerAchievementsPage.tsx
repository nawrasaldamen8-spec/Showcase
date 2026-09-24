import { Calendar, ExternalLink, Pencil, Trash2, Trophy } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { apiClient } from "../../../shared/api/apiClient.ts";
import { useToast } from "../../../shared/context/index.ts";
import type { CareerAchievement } from "../../../shared/types/index.ts";
import {
  AchievementModal,
  CareerEmptyState,
  CareerHeader,
  DeleteConfirmModal,
} from "../components/index.ts";

export const CareerAchievementsPage: React.FC = () => {
  const [achievements, setAchievements] = useState<CareerAchievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CareerAchievement | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CareerAchievement | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { showToast } = useToast();

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiClient.getAchievements();
      setAchievements(data);
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to load achievements");
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

  const handleOpenEdit = (item: CareerAchievement) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleSave = async (data: Omit<CareerAchievement, "id" | "createdAt">) => {
    try {
      setIsSaving(true);
      if (editingItem) {
        await apiClient.updateAchievement(editingItem.id, data);
        showToast("success", "Achievement updated");
      } else {
        await apiClient.createAchievement(data);
        showToast("success", "Achievement recorded");
      }
      setModalOpen(false);
      setEditingItem(null);
      await loadItems();
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to save achievement");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await apiClient.deleteAchievement(deleteTarget.id);
      showToast("success", "Achievement expunged");
      setDeleteTarget(null);
      await loadItems();
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to expunge achievement");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <CareerHeader
        sectionTitle="Achievements"
        description="International design awards, published monographs, juried exhibitions, and career milestones."
        actionLabel="Add Achievement"
        onAction={handleOpenCreate}
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
          onAction={handleOpenCreate}
        />
      ) : (
        <div className="space-y-6">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className="p-6 sm:p-7 rounded-[24px] bg-[#faf9f5] border border-[#cccbc8]/60 hover:border-[#141413] transition-colors shadow-none"
            >
              <div className="flex flex-col md:flex-row gap-6">
                {ach.mediaUrl && (
                  <div className="w-full md:w-56 h-40 rounded-xl overflow-hidden bg-[#f0eee6] border border-[#cccbc8]/50 shrink-0">
                    <img
                      src={ach.mediaUrl}
                      alt={ach.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  </div>
                )}

                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex flex-wrap items-center gap-2">
                        {ach.type && (
                          <span className="font-gothic text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#f0eee6] border border-[#cccbc8]/40 text-[#87867f]">
                            {ach.type}
                          </span>
                        )}
                        {ach.organization && (
                          <span className="font-gothic text-xs font-bold uppercase tracking-[0.14em] text-[#d97757]">
                            {ach.organization}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(ach)}
                          className="p-1.5 rounded-lg text-[#87867f] hover:text-[#141413] hover:bg-[#f0eee6] transition-colors cursor-pointer"
                          aria-label={`Edit ${ach.title}`}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(ach)}
                          className="p-1.5 rounded-lg text-[#87867f] hover:text-red-600 hover:bg-red-50/40 transition-colors cursor-pointer"
                          aria-label={`Delete ${ach.title}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h3 className="font-gothic text-xl sm:text-2xl font-bold uppercase tracking-tight text-[#141413]">
                      {ach.title}
                    </h3>

                    {ach.date && (
                      <div className="flex items-center gap-1.5 text-xs font-serif text-[#141413]/70 mt-1">
                        <Calendar className="w-3.5 h-3.5 text-[#87867f]" />
                        <span>Conferred {ach.date}</span>
                      </div>
                    )}

                    {ach.description && (
                      <p className="font-serif text-[15px] leading-relaxed text-[#141413]/80 mt-3 pt-3 border-t border-[#cccbc8]/30">
                        {ach.description}
                      </p>
                    )}
                  </div>

                  {ach.url && (
                    <div className="mt-4 pt-3 border-t border-[#cccbc8]/30">
                      <a
                        href={ach.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 font-gothic text-[11px] font-bold uppercase tracking-wider text-[#d97757] hover:underline"
                      >
                        <span>View Official Citation</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Achievement Modal */}
      <AchievementModal
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
        title="Expunge Achievement"
        itemName={deleteTarget?.title || "this achievement"}
        isDeleting={isDeleting}
      />
    </div>
  );
};
