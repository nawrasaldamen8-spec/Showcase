import { Award, Image as ImageIcon, Link as LinkIcon, X } from "lucide-react";
import React, { useState } from "react";
import { Button } from "../../../shared/components/Button.tsx";
import type { CareerCredential } from "../../../shared/types/index.ts";

export interface CredentialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<CareerCredential, "id" | "createdAt">) => Promise<void>;
  initialData?: CareerCredential | null;
  isSaving?: boolean;
}

const CredentialModalForm: React.FC<Omit<CredentialModalProps, "isOpen">> = ({
  onClose,
  onSave,
  initialData,
  isSaving = false,
}) => {
  const [name, setName] = useState(initialData?.name || "");
  const [issuingOrganization, setIssuingOrganization] = useState(initialData?.issuingOrganization || "");
  const [issueDate, setIssueDate] = useState(initialData?.issueDate || "");
  const [expirationDate, setExpirationDate] = useState(initialData?.expirationDate || "");
  const [credentialId, setCredentialId] = useState(initialData?.credentialId || "");
  const [verificationUrl, setVerificationUrl] = useState(initialData?.verificationUrl || "");
  const [mediaUrl, setMediaUrl] = useState(initialData?.mediaUrl || "");

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (field?: string) => {
    const errs: Record<string, string> = { ...errors };

    if (!field || field === "name") {
      if (!name.trim()) errs.name = "Credential or Certificate title is required.";
      else delete errs.name;
    }
    if (!field || field === "issuingOrganization") {
      if (!issuingOrganization.trim()) errs.issuingOrganization = "Issuing organization is required.";
      else delete errs.issuingOrganization;
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validate(field);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, issuingOrganization: true });
    if (!validate()) return;

    await onSave({
      name: name.trim(),
      issuingOrganization: issuingOrganization.trim(),
      issueDate: issueDate.trim() || undefined,
      expirationDate: expirationDate.trim() || undefined,
      credentialId: credentialId.trim() || undefined,
      verificationUrl: verificationUrl.trim() || undefined,
      mediaUrl: mediaUrl.trim() || undefined,
    });
  };

  return (
    <div className="relative w-full max-w-xl my-8 rounded-[24px] bg-[#faf9f5] border border-[#cccbc8] p-6 sm:p-8 shadow-none text-[#141413]">
      <button
        type="button"
        onClick={onClose}
        disabled={isSaving}
        className="absolute top-6 right-6 text-[#87867f] hover:text-[#141413] transition-colors cursor-pointer"
        aria-label="Close dialog"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-[#f0eee6] border border-[#cccbc8]/60 flex items-center justify-center text-[#141413]">
          <Award className="w-5 h-5 stroke-[1.75]" />
        </div>
        <div>
          <span className="font-gothic text-[10px] font-bold uppercase tracking-[0.2em] text-[#87867f] block">
            Professional Recognition
          </span>
          <h2 id="credential-modal-title" className="font-gothic text-xl font-bold uppercase tracking-tight text-[#141413]">
            {initialData ? "Edit Credential" : "Add Credential or License"}
          </h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Credential Name */}
        <div>
          <label className="block font-gothic text-xs font-bold uppercase tracking-[0.12em] text-[#141413] mb-1.5">
            Credential / License Title <span className="text-[#d97757]">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) validate("name");
            }}
            onBlur={() => handleBlur("name")}
            placeholder="e.g. Certified Spatial Scenographer"
            className={`w-full px-3.5 py-2.5 rounded-xl bg-[#f0eee6] border text-sm text-[#141413] focus:outline-none focus:ring-1 focus:ring-[#141413] ${
              touched.name && errors.name ? "border-red-500 bg-red-50/20" : "border-[#cccbc8]/60"
            }`}
          />
          {touched.name && errors.name && (
            <p className="font-serif text-xs text-red-600 mt-1">{errors.name}</p>
          )}
        </div>

        {/* Issuing Organization */}
        <div>
          <label className="block font-gothic text-xs font-bold uppercase tracking-[0.12em] text-[#141413] mb-1.5">
            Issuing Organization <span className="text-[#d97757]">*</span>
          </label>
          <input
            type="text"
            value={issuingOrganization}
            onChange={(e) => {
              setIssuingOrganization(e.target.value);
              if (errors.issuingOrganization) validate("issuingOrganization");
            }}
            onBlur={() => handleBlur("issuingOrganization")}
            placeholder="e.g. Royal Institute of British Architects (RIBA)"
            className={`w-full px-3.5 py-2.5 rounded-xl bg-[#f0eee6] border text-sm text-[#141413] focus:outline-none focus:ring-1 focus:ring-[#141413] ${
              touched.issuingOrganization && errors.issuingOrganization ? "border-red-500 bg-red-50/20" : "border-[#cccbc8]/60"
            }`}
          />
          {touched.issuingOrganization && errors.issuingOrganization && (
            <p className="font-serif text-xs text-red-600 mt-1">{errors.issuingOrganization}</p>
          )}
        </div>

        {/* Issue Date & Expiration Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-gothic text-xs font-bold uppercase tracking-[0.12em] text-[#141413] mb-1.5">
              Issue Date
            </label>
            <input
              type="month"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#f0eee6] border border-[#cccbc8]/60 text-sm text-[#141413] focus:outline-none focus:ring-1 focus:ring-[#141413]"
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
              className="w-full px-3 py-2 rounded-xl bg-[#f0eee6] border border-[#cccbc8]/60 text-sm text-[#141413] focus:outline-none focus:ring-1 focus:ring-[#141413]"
            />
          </div>
        </div>

        {/* Credential ID */}
        <div>
          <label className="block font-gothic text-xs font-bold uppercase tracking-[0.12em] text-[#141413] mb-1.5">
            Credential ID / License Number
          </label>
          <input
            type="text"
            value={credentialId}
            onChange={(e) => setCredentialId(e.target.value)}
            placeholder="e.g. RIBA-SS-99201"
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#f0eee6] border border-[#cccbc8]/60 text-sm text-[#141413] focus:outline-none focus:ring-1 focus:ring-[#141413]"
          />
        </div>

        {/* Verification URL */}
        <div>
          <label className="block font-gothic text-xs font-bold uppercase tracking-[0.12em] text-[#141413] mb-1.5">
            Verification URL
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#87867f]">
              <LinkIcon className="w-4 h-4" />
            </span>
            <input
              type="url"
              value={verificationUrl}
              onChange={(e) => setVerificationUrl(e.target.value)}
              placeholder="https://www.architecture.com/verify"
              className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#f0eee6] border border-[#cccbc8]/60 text-sm text-[#141413] focus:outline-none focus:ring-1 focus:ring-[#141413]"
            />
          </div>
        </div>

        {/* Certificate Media / Preview URL */}
        <div>
          <label className="block font-gothic text-xs font-bold uppercase tracking-[0.12em] text-[#141413] mb-1.5">
            Certificate Image / Media URL
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#87867f]">
              <ImageIcon className="w-4 h-4" />
            </span>
            <input
              type="url"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              placeholder="https://images.unsplash.com/... or uploaded asset URL"
              className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#f0eee6] border border-[#cccbc8]/60 text-sm text-[#141413] focus:outline-none focus:ring-1 focus:ring-[#141413]"
            />
          </div>
          {mediaUrl && (
            <div className="mt-2.5 p-2 rounded-xl bg-[#f0eee6] border border-[#cccbc8]/60 max-w-xs overflow-hidden">
              <img
                src={mediaUrl}
                alt="Certificate Preview"
                className="w-full h-32 object-cover rounded-lg"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#cccbc8]/40">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onClose}
            disabled={isSaving}
            className="shadow-none uppercase tracking-wider text-xs font-bold"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="clay"
            size="md"
            disabled={isSaving}
            className="shadow-none uppercase tracking-wider text-xs font-bold"
          >
            {isSaving ? "Saving..." : initialData ? "Update Credential" : "Add Credential"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export const CredentialModal: React.FC<CredentialModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  isSaving = false,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="credential-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#141413]/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150"
    >
      <CredentialModalForm
        key={initialData?.id || "new-credential"}
        onClose={onClose}
        onSave={onSave}
        initialData={initialData}
        isSaving={isSaving}
      />
    </div>
  );
};
