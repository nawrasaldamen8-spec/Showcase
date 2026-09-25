import { Calendar, ExternalLink, Hash, Pencil, Trash2 } from "lucide-react";
import React from "react";
import type { CareerCredential } from "@shared/types/index.ts";

export interface CredentialCardProps {
  item: CareerCredential;
  onEdit: (item: CareerCredential) => void;
  onDelete: (item: CareerCredential) => void;
}

export const CredentialCard: React.FC<CredentialCardProps> = ({ item: cred, onEdit, onDelete }) => {
  return (
    <div className="p-6 sm:p-7 rounded-[24px] bg-[#faf9f5] border border-[#cccbc8]/60 hover:border-[#141413] transition-colors flex flex-col justify-between shadow-none">
      <div>
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
              onClick={() => onEdit(cred)}
              className="p-1.5 rounded-lg text-[#87867f] hover:text-[#141413] hover:bg-[#f0eee6] transition-colors cursor-pointer"
              aria-label={`Edit ${cred.name}`}
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(cred)}
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
                {cred.expirationDate ? ` \u2022 Expires ${cred.expirationDate}` : ""}
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
  );
};
