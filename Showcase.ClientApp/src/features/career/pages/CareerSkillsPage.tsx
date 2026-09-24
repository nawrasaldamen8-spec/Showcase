import { Pencil, Sparkles, Trash2 } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { apiClient } from "../../../shared/api/apiClient.ts";
import { useToast } from "../../../shared/context/index.ts";
import type { CareerSkill } from "../../../shared/types/index.ts";
import {
  CareerEmptyState,
  CareerHeader,
  DeleteConfirmModal,
  SkillModal,
} from "../components/index.ts";

const FILTER_CATEGORIES = ["All", "Design", "Technical", "Leadership", "Tools", "General"];

export const CareerSkillsPage: React.FC = () => {
  const [skills, setSkills] = useState<CareerSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CareerSkill | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CareerSkill | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { showToast } = useToast();

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiClient.getSkills();
      setSkills(data);
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to load skills");
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

  const filteredSkills = useMemo(() => {
    if (activeCategory === "All") return skills;
    return skills.filter(
      (s) => (s.category || "General").toLowerCase() === activeCategory.toLowerCase()
    );
  }, [skills, activeCategory]);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (item: CareerSkill) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleSave = async (data: Omit<CareerSkill, "id" | "createdAt">) => {
    try {
      setIsSaving(true);
      if (editingItem) {
        await apiClient.updateSkill(editingItem.id, data);
        showToast("success", "Skill updated");
      } else {
        await apiClient.createSkill(data);
        showToast("success", "Skill cataloged");
      }
      setModalOpen(false);
      setEditingItem(null);
      await loadItems();
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to save skill");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await apiClient.deleteSkill(deleteTarget.id);
      showToast("success", "Skill expunged");
      setDeleteTarget(null);
      await loadItems();
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to expunge skill");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <CareerHeader
        sectionTitle="Skills & Competencies"
        description="Curated index of technical proficiencies, spatial theories, design methodologies, and analog tools."
        actionLabel="Catalog Skill"
        onAction={handleOpenCreate}
      />

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 mb-8 pb-4 border-b border-[#cccbc8]/40">
        {FILTER_CATEGORIES.map((cat) => {
          const isSelected = activeCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full font-gothic text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border ${
                isSelected
                  ? "bg-[#141413] text-[#faf9f5] border-[#141413]"
                  : "bg-[#faf9f5] text-[#87867f] border-[#cccbc8]/60 hover:text-[#141413] hover:border-[#141413]"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="py-20 text-center text-[#87867f] font-serif">
          Curating competency catalog...
        </div>
      ) : filteredSkills.length === 0 ? (
        <CareerEmptyState
          icon={Sparkles}
          title={activeCategory === "All" ? "No Skills Cataloged" : `No ${activeCategory} Skills`}
          description={
            activeCategory === "All"
              ? "Your competency index is empty. Catalog your technical, design, and tool masteries to display your capabilities."
              : `No skills found under the "${activeCategory}" classification. You can catalog new skills or switch category filters.`
          }
          actionLabel="Catalog Skill"
          onAction={handleOpenCreate}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredSkills.map((skill) => (
            <div
              key={skill.id}
              className="p-5 rounded-[20px] bg-[#faf9f5] border border-[#cccbc8]/60 hover:border-[#141413] transition-colors flex flex-col justify-between shadow-none group"
            >
              <div>
                <span className="font-gothic text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#f0eee6] border border-[#cccbc8]/40 text-[#87867f] inline-block mb-2">
                  {skill.category || "General"}
                </span>
                <h4 className="font-gothic text-base font-bold uppercase tracking-tight text-[#141413]">
                  {skill.name}
                </h4>
              </div>

              <div className="flex items-center justify-end gap-1.5 mt-4 pt-3 border-t border-[#cccbc8]/30">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(skill)}
                  className="p-1.5 rounded-lg text-[#87867f] hover:text-[#141413] hover:bg-[#f0eee6] transition-colors cursor-pointer"
                  aria-label={`Edit ${skill.name}`}
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(skill)}
                  className="p-1.5 rounded-lg text-[#87867f] hover:text-red-600 hover:bg-red-50/40 transition-colors cursor-pointer"
                  aria-label={`Delete ${skill.name}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Skill Modal */}
      <SkillModal
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
        title="Expunge Skill"
        itemName={deleteTarget?.name || "this skill"}
        isDeleting={isDeleting}
      />
    </div>
  );
};
