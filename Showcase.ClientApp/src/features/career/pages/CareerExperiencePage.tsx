import { Briefcase, Calendar, MapPin, Pencil, Trash2 } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { apiClient } from "../../../shared/api/apiClient.ts";
import { useToast } from "../../../shared/context/index.ts";
import type { CareerExperience } from "../../../shared/types/index.ts";
import {
  CareerEmptyState,
  CareerHeader,
  DeleteConfirmModal,
  ExperienceModal,
} from "../components/index.ts";

export const CareerExperiencePage: React.FC = () => {
  const [experiences, setExperiences] = useState<CareerExperience[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CareerExperience | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CareerExperience | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { showToast } = useToast();

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiClient.getExperiences();
      setExperiences(data);
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to load experience records");
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

  const handleOpenEdit = (item: CareerExperience) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleSave = async (data: Omit<CareerExperience, "id" | "createdAt">) => {
    try {
      setIsSaving(true);
      if (editingItem) {
        await apiClient.updateExperience(editingItem.id, data);
        showToast("success", "Position updated successfully");
      } else {
        await apiClient.createExperience(data);
        showToast("success", "Position recorded successfully");
      }
      setModalOpen(false);
      setEditingItem(null);
      await loadItems();
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to save experience position");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await apiClient.deleteExperience(deleteTarget.id);
      showToast("success", "Position expunged successfully");
      setDeleteTarget(null);
      await loadItems();
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to expunge position");
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDateRange = (exp: CareerExperience) => {
    const start = exp.startDate;
    const end = exp.currentlyWorking ? "Present" : exp.endDate || "Present";
    return `${start} — ${end}`;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <CareerHeader
        sectionTitle="Experience"
        description="Chronological record of directorial engagements, studio collaborations, and spatial design roles."
        actionLabel="Add Position"
        onAction={handleOpenCreate}
      />

      {loading ? (
        <div className="py-20 text-center text-[#87867f] font-serif">
          Curating chronological records...
        </div>
      ) : experiences.length === 0 ? (
        <CareerEmptyState
          icon={Briefcase}
          title="No Experience Recorded"
          description="Your professional timeline has not yet been documented. Add your current and previous studio positions to showcase your trajectory."
          actionLabel="Record First Position"
          onAction={handleOpenCreate}
        />
      ) : (
        <div className="space-y-6">
          {experiences.map((exp) => (
            <div
              key={exp.id}
              className="p-6 sm:p-7 rounded-[24px] bg-[#faf9f5] border border-[#cccbc8]/60 hover:border-[#141413] transition-colors shadow-none"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-gothic text-xs font-bold uppercase tracking-[0.14em] text-[#d97757]">
                      {exp.company}
                    </span>
                    {exp.employmentType && (
                      <span className="font-gothic text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#f0eee6] border border-[#cccbc8]/40 text-[#87867f]">
                        {exp.employmentType}
                      </span>
                    )}
                    {exp.currentlyWorking && (
                      <span className="font-gothic text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#d97757]/10 text-[#d97757] border border-[#d97757]/30">
                        Current Role
                      </span>
                    )}
                  </div>

                  <h3 className="font-gothic text-xl sm:text-2xl font-bold uppercase tracking-tight text-[#141413]">
                    {exp.jobTitle}
                  </h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs font-serif text-[#141413]/70 pt-1">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#87867f]" />
                      {formatDateRange(exp)}
                    </span>
                    {exp.location && (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#87867f]" />
                        {exp.location}
                      </span>
                    )}
                  </div>
                </div>

                {/* Edit & Delete Actions */}
                <div className="flex items-center gap-2 self-end sm:self-start">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(exp)}
                    className="p-2 rounded-xl text-[#87867f] hover:text-[#141413] hover:bg-[#f0eee6] transition-colors cursor-pointer"
                    aria-label={`Edit ${exp.jobTitle}`}
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(exp)}
                    className="p-2 rounded-xl text-[#87867f] hover:text-red-600 hover:bg-red-50/40 transition-colors cursor-pointer"
                    aria-label={`Delete ${exp.jobTitle}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Description */}
              {exp.description && (
                <p className="font-serif text-[15px] leading-relaxed text-[#141413]/80 mt-4 pt-3 border-t border-[#cccbc8]/30">
                  {exp.description}
                </p>
              )}

              {/* Achievements */}
              {exp.achievements && (
                <div className="mt-3 p-3 rounded-xl bg-[#f0eee6]/60 border border-[#cccbc8]/30">
                  <span className="font-gothic text-[10px] font-bold uppercase tracking-wider text-[#87867f] block mb-0.5">
                    Notable Milestone
                  </span>
                  <p className="font-serif text-xs text-[#141413]/85 italic">
                    {exp.achievements}
                  </p>
                </div>
              )}

              {/* Skills Chips */}
              {exp.skillsUsed && exp.skillsUsed.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {exp.skillsUsed.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-[#f0eee6] text-[#141413] border border-[#cccbc8]/40 font-gothic text-[11px] font-semibold tracking-wider uppercase"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Experience Form Modal */}
      <ExperienceModal
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
        title="Expunge Position"
        itemName={deleteTarget?.jobTitle || "this position"}
        isDeleting={isDeleting}
      />
    </div>
  );
};
