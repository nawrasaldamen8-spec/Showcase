import { Award, Image as ImageIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiClient } from "@shared/api/apiClient.ts";
import { Button } from "@shared/components/Button.tsx";
import { useToast } from "@shared/context/index.ts";
import { CareerActionLayout } from "../components/CareerActionLayout.tsx";

export const CredentialFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [name, setName] = useState("");
  const [issuingOrganization, setIssuingOrganization] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [credentialId, setCredentialId] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");

  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!id) return;
    let mounted = true;

    async function loadItem() {
      setIsLoading(true);
      try {
        const items = await apiClient.getCredentials();
        const found = items.find((cred) => cred.id === id);
        if (found && mounted) {
          setName(found.name || "");
          setIssuingOrganization(found.issuingOrganization || "");
          setIssueDate(found.issueDate || "");
          setExpirationDate(found.expirationDate || "");
          setCredentialId(found.credentialId || "");
          setMediaUrl(found.mediaUrl || "");
        } else if (!found && mounted) {
          showToast("error", "Credential record not found.");
          navigate("/career/credentials");
        }
      } catch (err) {
        console.error("Failed to load credential record", err);
        if (mounted) {
          showToast("error", "Failed to load credential data.");
          navigate("/career/credentials");
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    void loadItem();
    return () => {
      mounted = false;
    };
  }, [id, navigate, showToast]);

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

    setIsSaving(true);
    try {
      const payload = {
        name: name.trim(),
        issuingOrganization: issuingOrganization.trim(),
        issueDate: issueDate.trim() || undefined,
        expirationDate: expirationDate.trim() || undefined,
        credentialId: credentialId.trim() || undefined,
        mediaUrl: mediaUrl.trim() || undefined,
      };

      if (isEditing && id) {
        await apiClient.updateCredential(id, payload);
        showToast("success", "Credential updated successfully.");
      } else {
        await apiClient.createCredential(payload);
        showToast("success", "Credential recorded successfully.");
      }
      navigate("/career/credentials");
    } catch (err) {
      console.error("Failed to save credential", err);
      showToast("error", "Failed to save credential.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <CareerActionLayout
        title={isEditing ? "Edit Certification" : "Add Certification"}
        subtitle="Add details about your certification or license."
        backTo="/career/credentials"
        backLabel="Back to Credentials"
        icon={Award}
      >
        <div className="py-12 text-center text-[#87867f] font-serif">
          Loading certification details...
        </div>
      </CareerActionLayout>
    );
  }

  return (
    <CareerActionLayout
      title={isEditing ? "Edit Certification" : "Add Certification"}
      subtitle="Add details about your certification or license."
      backTo="/career/credentials"
      backLabel="Back to Credentials"
      icon={Award}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Credential Name */}
        <div>
          <label className="block font-gothic text-xs font-bold uppercase tracking-[0.12em] text-[#141413] mb-1.5">
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

        {/* Credential ID */}
        <div>
          <label className="block font-gothic text-xs font-bold uppercase tracking-[0.12em] text-[#141413] mb-1.5">
            Credential ID (Optional)
          </label>
          <input
            type="text"
            value={credentialId}
            onChange={(e) => setCredentialId(e.target.value)}
            placeholder="e.g. AWS-10928374 or ABC-12345"
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#f0eee6] border border-[#cccbc8]/60 text-sm text-[#141413] focus:outline-none focus:ring-1 focus:ring-[#141413]"
          />
        </div>

        {/* Media URL */}
        <div>
          <label className="block font-gothic text-xs font-bold uppercase tracking-[0.12em] text-[#141413] mb-1.5">
            Credential URL (Optional)
          </label>
          <div className="relative">
            <input
              type="url"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              placeholder="https://example.com/certificate/123"
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#f0eee6] border border-[#cccbc8]/60 text-sm text-[#141413] focus:outline-none focus:ring-1 focus:ring-[#141413]"
            />
            <ImageIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#87867f]" />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 pt-5 border-t border-[#cccbc8]/40">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={() => navigate("/career/credentials")}
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
    </CareerActionLayout>
  );
};
