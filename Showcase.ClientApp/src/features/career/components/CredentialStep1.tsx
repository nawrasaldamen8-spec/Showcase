import { ArrowRight } from "lucide-react";
import React from "react";
import { Button } from "@shared/components/Button.tsx";

export interface CredentialStep1Props {
  name: string;
  setName: (v: string) => void;
  issuingOrganization: string;
  setIssuingOrganization: (v: string) => void;
  touched: Record<string, boolean>;
  errors: Record<string, string>;
  validate: (field?: string) => boolean;
  handleBlur: (field: string) => void;
  onCancel: () => void;
  onContinue: (e: React.MouseEvent) => void;
  isSaving: boolean;
}

export const CredentialStep1: React.FC<CredentialStep1Props> = ({
  name,
  setName,
  issuingOrganization,
  setIssuingOrganization,
  touched,
  errors,
  validate,
  handleBlur,
  onCancel,
  onContinue,
  isSaving,
}) => {
  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      <div>
        <label className="block font-gothic text-xs font-bold uppercase tracking-[0.12em] text-[#141413] mb-1.5">
          Credential / License Title
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

      <div>
        <label className="block font-gothic text-xs font-bold uppercase tracking-[0.12em] text-[#141413] mb-1.5">
          Issuing Organization
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

      <div className="flex items-center justify-between pt-4 border-t border-[#cccbc8]/40">
        <Button
          type="button"
          variant="outline"
          size="md"
          onClick={onCancel}
          disabled={isSaving}
          className="shadow-none uppercase tracking-wider text-xs font-bold"
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="clay"
          size="md"
          onClick={onContinue}
          disabled={isSaving}
          className="shadow-none uppercase tracking-wider text-xs font-bold inline-flex items-center gap-1.5"
        >
          Continue
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
};
