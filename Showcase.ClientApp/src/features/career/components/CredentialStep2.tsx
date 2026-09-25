import { ArrowLeft, Image as ImageIcon, Link as LinkIcon } from "lucide-react";
import React from "react";
import { Button } from "@shared/components/Button.tsx";

export interface CredentialStep2Props {
  issueDate: string;
  setIssueDate: (v: string) => void;
  expirationDate: string;
  setExpirationDate: (v: string) => void;
  credentialId: string;
  setCredentialId: (v: string) => void;
  verificationUrl: string;
  setVerificationUrl: (v: string) => void;
  mediaUrl: string;
  setMediaUrl: (v: string) => void;
  onBack: () => void;
  isSaving: boolean;
  isEditing: boolean;
}

export const CredentialStep2: React.FC<CredentialStep2Props> = ({
  issueDate,
  setIssueDate,
  expirationDate,
  setExpirationDate,
  credentialId,
  setCredentialId,
  verificationUrl,
  setVerificationUrl,
  mediaUrl,
  setMediaUrl,
  onBack,
  isSaving,
  isEditing,
}) => {
  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block font-gothic text-xs font-bold uppercase tracking-[0.12em] text-[#141413] mb-1.5">
            Issue Date
          </label>
          <input
            type="month"
            value={issueDate}
            onChange={(e) => setIssueDate(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#f0eee6] border border-[#cccbc8]/60 text-sm text-[#141413] focus:outline-none focus:ring-1 focus:ring-[#141413]"
          />
        </div>

        <div>
          <label className="block font-gothic text-xs font-bold uppercase tracking-[0.12em] text-[#141413] mb-1.5">
            Expiration Date
          </label>
          <input
            type="month"
            value={expirationDate}
            onChange={(e) => setExpirationDate(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#f0eee6] border border-[#cccbc8]/60 text-sm text-[#141413] focus:outline-none focus:ring-1 focus:ring-[#141413]"
          />
        </div>
      </div>

      <div>
        <label className="block font-gothic text-xs font-bold uppercase tracking-[0.12em] text-[#141413] mb-1.5">
          Credential ID / License Number
        </label>
        <input
          type="text"
          value={credentialId}
          onChange={(e) => setCredentialId(e.target.value)}
          placeholder="e.g. RIBA-ARCH-2024-8849"
          className="w-full px-3.5 py-2.5 rounded-xl bg-[#f0eee6] border border-[#cccbc8]/60 text-sm text-[#141413] focus:outline-none focus:ring-1 focus:ring-[#141413]"
        />
      </div>

      <div>
        <label className="block font-gothic text-xs font-bold uppercase tracking-[0.12em] text-[#141413] mb-1.5">
          Verification Link / Authority URL
        </label>
        <div className="relative">
          <input
            type="url"
            value={verificationUrl}
            onChange={(e) => setVerificationUrl(e.target.value)}
            placeholder="https://verify.riba.org/credentials/8849"
            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#f0eee6] border border-[#cccbc8]/60 text-sm text-[#141413] focus:outline-none focus:ring-1 focus:ring-[#141413]"
          />
          <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#87867f]" />
        </div>
      </div>

      <div>
        <label className="block font-gothic text-xs font-bold uppercase tracking-[0.12em] text-[#141413] mb-1.5">
          Certificate Image / Press Photo URL
        </label>
        <div className="relative">
          <input
            type="url"
            value={mediaUrl}
            onChange={(e) => setMediaUrl(e.target.value)}
            placeholder="https://images.unsplash.com/... or hosted certificate"
            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#f0eee6] border border-[#cccbc8]/60 text-sm text-[#141413] focus:outline-none focus:ring-1 focus:ring-[#141413]"
          />
          <ImageIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#87867f]" />
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-[#cccbc8]/40">
        <Button
          type="button"
          variant="outline"
          size="md"
          onClick={onBack}
          disabled={isSaving}
          className="shadow-none uppercase tracking-wider text-xs font-bold inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </Button>
        <Button
          type="submit"
          variant="clay"
          size="md"
          disabled={isSaving}
          className="shadow-none uppercase tracking-wider text-xs font-bold"
        >
          {isSaving ? "Saving..." : isEditing ? "Update Credential" : "Save Credential"}
        </Button>
      </div>
    </div>
  );
};
