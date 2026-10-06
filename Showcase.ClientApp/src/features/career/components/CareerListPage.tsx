import type { LucideIcon } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import type { CareerVisibilitySettings } from "@shared/types/index.ts";
import { useCareerVisibility } from "../hooks/useCareerVisibility.ts";
import { CareerEmptyState } from "./CareerEmptyState.tsx";
import { CareerHeader } from "./CareerHeader.tsx";
import { DeleteConfirmModal } from "./DeleteConfirmModal.tsx";

export interface CareerListPageConfig<T extends { id: string }> {
  sectionKey: keyof CareerVisibilitySettings;
  sectionTitle: string;
  description: string;
  actionLabel: string;
  newRoute: string;
  editRoute: (id: string) => string;
  loadFn: () => Promise<T[]>;
  deleteFn: (id: string) => Promise<void>;
  entityLabel: string;
  emptyIcon: LucideIcon;
  emptyTitle: string;
  emptyDescription: string;
  getItemName: (item: T) => string;
  renderCard: (item: T, onEdit: (item: T) => void, onDelete: (item: T) => void) => React.ReactNode;
  gridClassName?: string;
}

export function CareerListPage<T extends { id: string }>({
  sectionKey,
  sectionTitle,
  description,
  actionLabel,
  newRoute,
  editRoute,
  loadFn,
  deleteFn,
  entityLabel,
  emptyIcon: EmptyIcon,
  emptyTitle,
  emptyDescription,
  getItemName,
  renderCard,
  gridClassName = "space-y-6",
}: CareerListPageConfig<T>): React.ReactElement {
  const navigate = useNavigate();
  const { visibility, isToggling, toggleSection } = useCareerVisibility();
  const isMounted = useRef(true);

  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<T | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const data = await loadFn();
        if (!cancelled && isMounted.current) {
          setItems(data);
        }
      } catch {
        if (!cancelled && isMounted.current) {
          toast.error(`Failed to load ${entityLabel.toLowerCase()}s`);
        }
      } finally {
        if (!cancelled && isMounted.current) {
          setLoading(false);
        }
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [loadFn, entityLabel]);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteFn(deleteTarget.id);
      if (isMounted.current) {
        setItems((prev) => prev.filter((i) => i.id !== deleteTarget.id));
        setDeleteTarget(null);
        toast.success(`${entityLabel} deleted`);
      }
    } catch {
      if (isMounted.current) {
        toast.error(`Failed to delete ${entityLabel.toLowerCase()}`);
      }
    } finally {
      if (isMounted.current) {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <CareerHeader
        sectionTitle={sectionTitle}
        description={description}
        actionLabel={actionLabel}
        onAction={() => navigate(newRoute)}
        showVisibilityToggle={true}
        isVisibleInProfile={visibility[sectionKey]}
        onToggleVisibility={(val) => toggleSection(sectionKey, val)}
        isTogglingVisibility={isToggling}
      />

      {loading ? (
        <div className="py-20 text-center text-cloud-dark font-serif">
          Loading {entityLabel.toLowerCase()}s...
        </div>
      ) : items.length === 0 ? (
        <CareerEmptyState
          icon={EmptyIcon}
          title={emptyTitle}
          description={emptyDescription}
          actionLabel={actionLabel}
          onAction={() => navigate(newRoute)}
        />
      ) : (
        <div className={gridClassName}>
          {items.map((item) =>
            renderCard(
              item,
              (itm) => navigate(editRoute(itm.id)),
              (itm) => setDeleteTarget(itm)
            )
          )}
        </div>
      )}

      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title={`Delete ${entityLabel}`}
        itemName={deleteTarget ? getItemName(deleteTarget) : `this ${entityLabel.toLowerCase()}`}
        isDeleting={isDeleting}
      />
    </div>
  );
}
