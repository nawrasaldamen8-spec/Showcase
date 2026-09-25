import { Award, X } from "lucide-react";
import React, { useState } from "react";
import type { CareerCredential } from "@shared/types/index.ts";
import { CredentialStep1 } from "./CredentialStep1.tsx";
import { CredentialStep2 } from "./CredentialStep2.tsx";

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
  const [step, setStep] = useState<1 | 2>(1);

  // Mandatory fields (Step 1)
  const [name, setName] = useState(initialData?.name || "");
  const [issuingOrganization, setIssuingOrganization] = useState(initialData?.issuingOrganization || "");

  // Additional fields (Step 2)
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
      if (!name.trim()) errs.name = "Credential or Certificate title is needed to proceed.";
      else delete errs.name;
    }
    if (!field || field === "issuingOrganization") {
      if (!issuingOrganization.trim()) errs.issuingOrganization = "Issuing organization is needed to proceed.";
      else delete errs.issuingOrganization;
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validate(field);
  };

  const handleContinue = (e: React.MouseEvent) => {
    e.preventDefault();
    setTouched({ name: true, issuingOrganization: true });
    if (!validate()) return;
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, issuingOrganization: true });
    if (!validate()) {
      setStep(1);
      return;
    }

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
          <span className="font-gothic text-xs font-bold uppercase tracking-[0.2em] text-[#87867f] block">
            Professional Recognition • Step {step} of 2
          </span>
          <h2 id="credential-modal-title" className="font-gothic text-xl font-bold uppercase tracking-tight text-[#141413]">
            {initialData ? "Edit Credential" : "Add Credential or License"}
          </h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {step === 1 ? (
          <CredentialStep1
            name={name}
            setName={setName}
            issuingOrganization={issuingOrganization}
            setIssuingOrganization={setIssuingOrganization}
            touched={touched}
            errors={errors}
            validate={validate}
            handleBlur={handleBlur}
            onCancel={onClose}
            onContinue={handleContinue}
            isSaving={isSaving}
          />
        ) : (
          <CredentialStep2
            issueDate={issueDate}
            setIssueDate={setIssueDate}
            expirationDate={expirationDate}
            setExpirationDate={setExpirationDate}
            credentialId={credentialId}
            setCredentialId={setCredentialId}
            verificationUrl={verificationUrl}
            setVerificationUrl={setVerificationUrl}
            mediaUrl={mediaUrl}
            setMediaUrl={setMediaUrl}
            onBack={() => setStep(1)}
            isSaving={isSaving}
            isEditing={Boolean(initialData)}
          />
        )}
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
        key={initialData?.id || "new-cred"}
        onClose={onClose}
        onSave={onSave}
        initialData={initialData}
        isSaving={isSaving}
      />
    </div>
  );
};
