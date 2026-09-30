import { Calendar, Hash } from "lucide-react";
import React from "react";
import type { CareerCredential } from "@shared/types/index.ts";
import { CareerCardActions } from "./CareerCardActions.tsx";
import { CareerCardShell } from "./CareerCardShell.tsx";

export interface CredentialCardProps {
  item: CareerCredential;
  onEdit?: (item: CareerCredential) => void;
  onDelete?: (item: CareerCredential) => void;
}

export const CredentialCard: React.FC<CredentialCardProps> = ({ item: cred, onEdit, onDelete }) => {
  return (
    <CareerCardShell className="flex flex-col justify-between">
      <div>
        {cred.mediaUrl && (
          <div className="mb-4 h-36 rounded-xl overflow-hidden bg-ivory-medium border border-stone/50">
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
          <span className="font-gothic text-xs font-bold uppercase tracking-[0.14em] text-clay break-words">
            {cred.issuingOrganization}
          </span>
          <CareerCardActions
            itemName={cred.name}
            onEdit={onEdit ? () => onEdit(cred) : undefined}
            onDelete={onDelete ? () => onDelete(cred) : undefined}
            compact
          />
        </div>

        <h3 className="font-gothic text-lg sm:text-xl font-bold uppercase tracking-tight text-slate-dark mb-3 break-words">
          {cred.name}
        </h3>

        <div className="space-y-1.5 text-xs font-serif text-slate-dark/70 pt-2 border-t border-stone/30">
          {cred.issueDate && (
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-cloud-dark shrink-0" />
              <span className="break-words">
                Issued {cred.issueDate}
                {cred.expiryDate ? ` \u2022 Expires ${cred.expiryDate}` : ""}
              </span>
            </div>
          )}

          {cred.credentialId && (
            <div className="flex items-center gap-2">
              <Hash className="w-3.5 h-3.5 text-cloud-dark shrink-0" />
              <span className="font-mono text-[11px] text-slate-dark/85 break-all">
                ID: {cred.credentialId}
              </span>
            </div>
          )}
        </div>
      </div>
    </CareerCardShell>
  );
};
