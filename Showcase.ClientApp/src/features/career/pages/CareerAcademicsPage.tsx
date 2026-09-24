import { Calendar, GraduationCap, MapPin, Pencil, Trash2 } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { apiClient } from "../../../shared/api/apiClient.ts";
import { useToast } from "../../../shared/context/index.ts";
import type { CareerAcademic } from "../../../shared/types/index.ts";
import {
  AcademicModal,
  CareerEmptyState,
  CareerHeader,
  DeleteConfirmModal,
} from "../components/index.ts";

export const CareerAcademicsPage: React.FC = () => {
  const [academics, setAcademics] = useState<CareerAcademic[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CareerAcademic | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CareerAcademic | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { showToast } = useToast();

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiClient.getAcademics();
      setAcademics(data);
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to load academic records");
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

  const handleOpenEdit = (item: CareerAcademic) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleSave = async (data: Omit<CareerAcademic, "id" | "createdAt">) => {
    try {
      setIsSaving(true);
      if (editingItem) {
        await apiClient.updateAcademic(editingItem.id, data);
        showToast("success", "Academic record updated");
      } else {
        await apiClient.createAcademic(data);
        showToast("success", "Academic record added");
      }
      setModalOpen(false);
      setEditingItem(null);
      await loadItems();
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to save academic record");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await apiClient.deleteAcademic(deleteTarget.id);
      showToast("success", "Academic record expunged");
      setDeleteTarget(null);
      await loadItems();
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to expunge academic record");
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDateRange = (acad: CareerAcademic) => {
    const start = acad.startDate;
    const end = acad.currentlyStudying ? "Present" : acad.endDate || "Present";
    return `${start} — ${end}`;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <CareerHeader
        sectionTitle="Academics"
        description="Formal academic degrees, architectural qualifications, and scholarly research theses."
        actionLabel="Add Degree"
        onAction={handleOpenCreate}
      />

      {loading ? (
        <div className="py-20 text-center text-[#87867f] font-serif">
          Curating academic credentials...
        </div>
      ) : academics.length === 0 ? (
        <CareerEmptyState
          icon={GraduationCap}
          title="No Academic Records"
          description="Your scholarly history has not yet been cataloged. Record your degrees and research programs to showcase your foundation."
          actionLabel="Record Degree"
          onAction={handleOpenCreate}
        />
      ) : (
        <div className="space-y-6">
          {academics.map((acad) => (
            <div
              key={acad.id}
              className="p-6 sm:p-7 rounded-[24px] bg-[#faf9f5] border border-[#cccbc8]/60 hover:border-[#141413] transition-colors shadow-none"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-gothic text-xs font-bold uppercase tracking-[0.14em] text-[#d97757]">
                      {acad.institution}
                    </span>
                    {acad.gpa && (
                      <span className="font-gothic text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#f0eee6] border border-[#cccbc8]/40 text-[#87867f]">
                        {acad.gpa}
                      </span>
                    )}
                    {acad.currentlyStudying && (
                      <span className="font-gothic text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#d97757]/10 text-[#d97757] border border-[#d97757]/30">
                        Currently Enrolled
                      </span>
                    )}
                  </div>

                  <h3 className="font-gothic text-xl sm:text-2xl font-bold uppercase tracking-tight text-[#141413]">
                    {acad.degree}
                  </h3>
                  <p className="font-serif text-[15px] font-medium text-[#141413]">
                    {acad.fieldOfStudy}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs font-serif text-[#141413]/70 pt-1">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#87867f]" />
                      {formatDateRange(acad)}
                    </span>
                    {acad.location && (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#87867f]" />
                        {acad.location}
                      </span>
                    )}
                  </div>
                </div>

                {/* Edit & Delete Actions */}
                <div className="flex items-center gap-2 self-end sm:self-start">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(acad)}
                    className="p-2 rounded-xl text-[#87867f] hover:text-[#141413] hover:bg-[#f0eee6] transition-colors cursor-pointer"
                    aria-label={`Edit ${acad.degree}`}
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(acad)}
                    className="p-2 rounded-xl text-[#87867f] hover:text-red-600 hover:bg-red-50/40 transition-colors cursor-pointer"
                    aria-label={`Delete ${acad.degree}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Description / Thesis */}
              {acad.description && (
                <div className="mt-4 pt-3 border-t border-[#cccbc8]/30">
                  <span className="font-gothic text-[10px] font-bold uppercase tracking-wider text-[#87867f] block mb-1">
                    Thesis & Investigation
                  </span>
                  <p className="font-serif text-[15px] leading-relaxed text-[#141413]/80">
                    {acad.description}
                  </p>
                </div>
              )}

              {/* Achievements */}
              {acad.achievements && (
                <div className="mt-3 p-3 rounded-xl bg-[#f0eee6]/60 border border-[#cccbc8]/30">
                  <span className="font-gothic text-[10px] font-bold uppercase tracking-wider text-[#87867f] block mb-0.5">
                    Scholastic Recognition
                  </span>
                  <p className="font-serif text-xs text-[#141413]/85 italic">
                    {acad.achievements}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Academic Form Modal */}
      <AcademicModal
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
        title="Expunge Academic Record"
        itemName={deleteTarget?.degree || "this degree"}
        isDeleting={isDeleting}
      />
    </div>
  );
};
