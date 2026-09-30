import React, { useState } from "react";
import { Image as ImageIcon } from "lucide-react";
import { Button } from "@shared/components/Button.tsx";
import type { CareerCredential } from "@shared/types/index.ts";

export interface CredentialFormProps {
  initialItem: CareerCredential | null;
  isEditing: boolean;
  isSaving: boolean;
  onSave: (payload: Partial<CareerCredential>, validate?: () => boolean) => Promise<void>;
  onCancel: () => void;
}

export const CredentialForm: React.FC<CredentialFormProps> = ({
  initialItem,
  isEditing,
  isSaving,
  onSave,
  onCancel,
}) => {
  const [name, setName] = useState(initialItem?.name || "");
  const [issuingOrganization, setIssuingOrganization] = useState(initialItem?.issuingOrganization || "");
  const [issueDate, setIssueDate] = useState(initialItem?.issueDate || "");
  const [expiryDate, setExpiryDate] = useState(initialItem?.expiryDate || "");
  const [credentialId, setCredentialId] = useState(initialItem?.credentialId || "");
  const [mediaUrl, setMediaUrl] = useState(initialItem?.mediaUrl || "");

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, issuingOrganization: true });

    const payload: Partial<CareerCredential> = {
      name: name.trim(),
      issuingOrganization: issuingOrganization.trim(),
      issueDate: issueDate.trim() || undefined,
      expiryDate: expiryDate.trim() || undefined,
      credentialId: credentialId.trim() || undefined,
      mediaUrl: mediaUrl.trim() || undefined,
    };

    void onSave(payload, validate);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Credential Name */}
      <div>
        <label className="block font-gothic text-xs font-bold uppercase tracking-[0.12em] text-slate-dark mb-1.5">
          Certification Name <span className="text-red-500 font-bold">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (errors.name) validate("name");
          }}
          onBlur={() => handleBlur("name")}
          placeholder="e.g. AWS Certified Solutions Architect or Professional Scrum Master"
          className={`w-full px-3.5 py-2.5 rounded-xl bg-ivory-medium border text-sm text-slate-dark focus:outline-none focus:ring-1 focus:ring-slate-dark ${
            touched.name && errors.name ? "border-red-500 bg-red-50/20" : "border-stone/60"
          }`}
        />
        {touched.name && errors.name && (
          <p className="font-serif text-xs text-red-600 mt-1">{errors.name}</p>
        )}
      </div>

      {/* Issuing Organization */}
      <div>
        <label className="block font-gothic text-xs font-bold uppercase tracking-[0.12em] text-slate-dark mb-1.5">
          Issuing Organization <span className="text-red-500 font-bold">*</span>
        </label>
        <input
          type="text"
          value={issuingOrganization}
          onChange={(e) => {
            setIssuingOrganization(e.target.value);
            if (errors.issuingOrganization) validate("issuingOrganization");
          }}
          onBlur={() => handleBlur("issuingOrganization")}
          placeholder="e.g. Amazon Web Services, Google, or Scrum.org"
          className={`w-full px-3.5 py-2.5 rounded-xl bg-ivory-medium border text-sm text-slate-dark focus:outline-none focus:ring-1 focus:ring-slate-dark ${
            touched.issuingOrganization && errors.issuingOrganization ? "border-red-500 bg-red-50/20" : "border-stone/60"
          }`}
        />
        {touched.issuingOrganization && errors.issuingOrganization && (
          <p className="font-serif text-xs text-red-600 mt-1">{errors.issuingOrganization}</p>
        )}
      </div>

      {/* Issue Date & Expiration Date */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block font-gothic text-xs font-bold uppercase tracking-[0.12em] text-slate-dark mb-1.5">
            Issue Date
          </label>
          <input
            type="month"
            value={issueDate}
            onChange={(e) => setIssueDate(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-ivory-medium border border-stone/60 text-sm text-slate-dark focus:outline-none focus:ring-1 focus:ring-slate-dark"
          />
        </div>

        <div>
          <label className="block font-gothic text-xs font-bold uppercase tracking-[0.12em] text-slate-dark mb-1.5">
            Expiration Date
          </label>
          <input
            type="month"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-ivory-medium border border-stone/60 text-sm text-slate-dark focus:outline-none focus:ring-1 focus:ring-slate-dark"
          />
        </div>
      </div>

      {/* Credential ID */}
      <div>
        <label className="block font-gothic text-xs font-bold uppercase tracking-[0.12em] text-slate-dark mb-1.5">
          Credential ID (Optional)
        </label>
        <input
          type="text"
          value={credentialId}
          onChange={(e) => setCredentialId(e.target.value)}
          placeholder="e.g. AWS-10928374 or ABC-12345"
          className="w-full px-3.5 py-2.5 rounded-xl bg-ivory-medium border border-stone/60 text-sm text-slate-dark focus:outline-none focus:ring-1 focus:ring-slate-dark"
        />
      </div>

      {/* Media URL */}
      <div>
        <label className="block font-gothic text-xs font-bold uppercase tracking-[0.12em] text-slate-dark mb-1.5">
          Credential URL (Optional)
        </label>
        <div className="relative">
          <input
            type="url"
            value={mediaUrl}
            onChange={(e) => setMediaUrl(e.target.value)}
            placeholder="https://example.com/certificate/123"
            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-ivory-medium border border-stone/60 text-sm text-slate-dark focus:outline-none focus:ring-1 focus:ring-slate-dark"
          />
          <ImageIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cloud-dark" />
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 pt-5 border-t border-stone/40">
        <Button
          type="button"
          variant="outline"
          size="md"
          onClick={onCancel}
          disabled={isSaving}
          className="shadow-none uppercase tracking-wider text-xs font-bold w-full sm:w-auto"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="clay"
          size="md"
          disabled={isSaving}
          className="shadow-none uppercase tracking-wider text-xs font-bold w-full sm:w-auto"
        >
          {isSaving ? "Saving..." : isEditing ? "Update Certification" : "Save Certification"}
        </Button>
      </div>
    </form>
  );
};
