import { Award, Calendar, ExternalLink, Hash, Pencil, Trash2 } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { apiClient } from "../../../shared/api/apiClient.ts";
import { useToast } from "../../../shared/context/index.ts";
import type { CareerCredential } from "../../../shared/types/index.ts";
import {
  CareerEmptyState,
  CareerHeader,
  CredentialModal,
  DeleteConfirmModal,
} from "../components/index.ts";

export const CareerCredentialsPage: React.FC = () => {
  const [credentials, setCredentials] = useState<CareerCredential[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CareerCredential | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CareerCredential | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { showToast } = useToast();

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiClient.getCredentials();
      setCredentials(data);
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to load credentials");
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

  const handleOpenEdit = (item: CareerCredential) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleSave = async (data: Omit<CareerCredential, "id" | "createdAt">) => {
    try {
      setIsSaving(true);
      if (editingItem) {
        await apiClient.updateCredential(editingItem.id, data);
        showToast("success", "Credential updated");
      } else {
        await apiClient.createCredential(data);
        showToast("success", "Credential added");
      }
      setModalOpen(false);
      setEditingItem(null);
      await loadItems();
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to save credential");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await apiClient.deleteCredential(deleteTarget.id);
      showToast("success", "Credential expunged");
      setDeleteTarget(null);
      await loadItems();
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to expunge credential");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <CareerHeader
        sectionTitle="Credentials"
        description="Accreditations, institutional certifications, and professional board licenses."
        actionLabel="Add Credential"
        onAction={handleOpenCreate}
      />

      {loading ? (
        <div className="py-20 text-center text-[#87867f] font-serif">
          Curating credentials registry...
        </div>
      ) : credentials.length === 0 ? (
        <CareerEmptyState
          icon={Award}
          title="No Credentials Recorded"
          description="Your credentials catalog is empty. Add professional licenses, board certifications, and verified honors."
          actionLabel="Add Credential"
          onAction={handleOpenCreate}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {credentials.map((cred) => (
            <div
              key={cred.id}
              className="p-6 sm:p-7 rounded-[24px] bg-[#faf9f5] border border-[#cccbc8]/60 hover:border-[#141413] transition-colors flex flex-col justify-between shadow-none"
            >
              <div>
                {/* Media Image / Certificate Preview */}
                {cred.mediaUrl && (
                  <div className="mb-4 h-36 rounded-xl overflow-hidden bg-[#f0eee6] border border-[#cccbc8]/50">
                    <img
                      src={cred.mediaUrl}
                      alt={cred.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  </div>
                )}

                <div className="flex items-start justify-between gap-3 mb-2">
                  <span className="font-gothic text-xs font-bold uppercase tracking-[0.14em] text-[#d97757]">
                    {cred.issuingOrganization}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(cred)}
                      className="p-1.5 rounded-lg text-[#87867f] hover:text-[#141413] hover:bg-[#f0eee6] transition-colors cursor-pointer"
                      aria-label={`Edit ${cred.name}`}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(cred)}
                      className="p-1.5 rounded-lg text-[#87867f] hover:text-red-600 hover:bg-red-50/40 transition-colors cursor-pointer"
                      aria-label={`Delete ${cred.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="font-gothic text-lg sm:text-xl font-bold uppercase tracking-tight text-[#141413] mb-3">
                  {cred.name}
                </h3>

                <div className="space-y-1.5 text-xs font-serif text-[#141413]/70 pt-2 border-t border-[#cccbc8]/30">
                  {cred.issueDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-[#87867f]" />
                      <span>
                        Issued {cred.issueDate}
                        {cred.expirationDate ? ` &bull; Expires ${cred.expirationDate}` : ""}
                      </span>
                    </div>
                  )}

                  {cred.credentialId && (
                    <div className="flex items-center gap-2">
                      <Hash className="w-3.5 h-3.5 text-[#87867f]" />
                      <span className="font-mono text-[11px] text-[#141413]/85">
                        ID: {cred.credentialId}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {cred.verificationUrl && (
                <div className="mt-5 pt-3 border-t border-[#cccbc8]/30">
                  <a
                    href={cred.verificationUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 font-gothic text-[11px] font-bold uppercase tracking-wider text-[#d97757] hover:underline"
                  >
                    <span>Verify Credential</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Credential Modal */}
      <CredentialModal
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
        title="Expunge Credential"
        itemName={deleteTarget?.name || "this credential"}
        isDeleting={isDeleting}
      />
    </div>
  );
};
