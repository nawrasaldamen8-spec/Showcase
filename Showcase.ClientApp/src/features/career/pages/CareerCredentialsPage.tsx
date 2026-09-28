import { Award } from "lucide-react";
import React from "react";
import { apiClient } from "@shared/api/apiClient.ts";
import type { CareerCredential } from "@shared/types/index.ts";
import { CareerListPage, CredentialCard } from "../components/index.ts";

export const CareerCredentialsPage: React.FC = () => {
  return (
    <CareerListPage<CareerCredential>
      sectionKey="credentials"
      sectionTitle="Certifications & Licenses"
      description="Certificates, licenses, and professional accreditations."
      actionLabel="Add Certification"
      newRoute="/career/credentials/new"
      editRoute={(id) => `/career/credentials/${id}/edit`}
      loadFn={apiClient.getCredentials}
      deleteFn={apiClient.deleteCredential}
      entityLabel="Certification"
      emptyIcon={Award}
      emptyTitle="No Certifications Added"
      emptyDescription="Add your professional certifications, licenses, and course completions."
      getItemName={(c) => c.name}
      gridClassName="grid grid-cols-1 md:grid-cols-2 gap-6"
      renderCard={(item, onEdit, onDelete) => (
        <CredentialCard key={item.id} item={item} onEdit={onEdit} onDelete={onDelete} />
      )}
    />
  );
};
