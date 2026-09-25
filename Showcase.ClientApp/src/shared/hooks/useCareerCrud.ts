import { useCallback, useEffect, useState } from "react";
import { useToast } from "@shared/context/index.ts";

export interface CareerCrudMessages {
  loadError?: string;
  createSuccess?: string;
  updateSuccess?: string;
  saveError?: string;
  deleteSuccess?: string;
  deleteError?: string;
}

export interface UseCareerCrudConfig<T extends { id: string }, FormInput = Omit<T, "id" | "createdAt">> {
  loadFn: () => Promise<T[]>;
  createFn: (data: FormInput) => Promise<T>;
  updateFn: (id: string, data: FormInput) => Promise<T>;
  deleteFn: (id: string) => Promise<void>;
  entityLabel: string;
  messages?: CareerCrudMessages;
}

export interface UseCareerCrudResult<T, FormInput> {
  items: T[];
  setItems: React.Dispatch<React.SetStateAction<T[]>>;
  loading: boolean;
  modalOpen: boolean;
  editingItem: T | null;
  isSaving: boolean;
  deleteTarget: T | null;
  isDeleting: boolean;
  openCreate: () => void;
  openEdit: (item: T) => void;
  closeModal: () => void;
  setDeleteTarget: (item: T | null) => void;
  handleSave: (data: FormInput) => Promise<void>;
  handleDeleteConfirm: () => Promise<void>;
  reload: () => Promise<void>;
}

export function useCareerCrud<T extends { id: string }, FormInput = Omit<T, "id" | "createdAt">>({
  loadFn,
  createFn,
  updateFn,
  deleteFn,
  entityLabel,
  messages = {},
}: UseCareerCrudConfig<T, FormInput>): UseCareerCrudResult<T, FormInput> {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<T | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<T | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { showToast } = useToast();

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const data = await loadFn();
      setItems(data);
    } catch (err) {
      console.error(err);
      showToast("error", messages.loadError || `Failed to load ${entityLabel.toLowerCase()} records`);
    } finally {
      setLoading(false);
    }
  }, [loadFn, entityLabel, messages.loadError, showToast]);

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

  const openCreate = useCallback(() => {
    setEditingItem(null);
    setModalOpen(true);
  }, []);

  const openEdit = useCallback((item: T) => {
    setEditingItem(item);
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setEditingItem(null);
  }, []);

  const handleSave = useCallback(
    async (data: FormInput) => {
      try {
        setIsSaving(true);
        if (editingItem) {
          await updateFn(editingItem.id, data);
          showToast("success", messages.updateSuccess || `${entityLabel} updated successfully`);
        } else {
          await createFn(data);
          showToast("success", messages.createSuccess || `${entityLabel} recorded successfully`);
        }
        closeModal();
        await loadItems();
      } catch (err) {
        console.error(err);
        showToast("error", messages.saveError || `Failed to save ${entityLabel.toLowerCase()}`);
      } finally {
        setIsSaving(false);
      }
    },
    [editingItem, updateFn, createFn, closeModal, loadItems, entityLabel, messages, showToast]
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await deleteFn(deleteTarget.id);
      showToast("success", messages.deleteSuccess || `${entityLabel} expunged successfully`);
      setDeleteTarget(null);
      await loadItems();
    } catch (err) {
      console.error(err);
      showToast("error", messages.deleteError || `Failed to expunge ${entityLabel.toLowerCase()}`);
    } finally {
      setIsDeleting(false);
    }
  }, [deleteTarget, deleteFn, loadItems, entityLabel, messages, showToast]);

  return {
    items,
    setItems,
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
    reload: loadItems,
  };
}
