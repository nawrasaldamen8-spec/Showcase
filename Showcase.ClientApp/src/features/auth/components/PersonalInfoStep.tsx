import React from "react";
import { ArrowLeft, ArrowRight, FileText, Mail, User } from "lucide-react";
import { Button } from "@shared/components/Button.tsx";
import { Input } from "@shared/components/Input.tsx";

export interface PersonalInfoStepProps {
  name: string;
  setName: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  bio: string;
  setBio: (value: string) => void;
  onBack: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const PersonalInfoStep: React.FC<PersonalInfoStepProps> = ({
  name,
  setName,
  email,
  setEmail,
  bio,
  setBio,
  onBack,
  onSubmit,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {/* Full Name */}
      <div className="space-y-1.5">
        <label
          htmlFor="reg-name"
          className="flex items-center gap-2 font-gothic text-xs font-bold uppercase tracking-wider text-slate-dark"
        >
          <User className="w-3.5 h-3.5 text-cloud-dark" />
          <span>Full Name / Brand <span className="text-clay">*</span></span>
        </label>
        <Input
          id="reg-name"
          type="text"
          placeholder="e.g. Elena Vance or Studio Mono"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoFocus
        />
      </div>

      {/* Email (Optional) */}
      <div className="space-y-1.5">
        <label
          htmlFor="reg-email"
          className="flex items-center gap-2 font-gothic text-xs font-bold uppercase tracking-wider text-slate-dark"
        >
          <Mail className="w-3.5 h-3.5 text-cloud-dark" />
          <span>Email Address <span className="font-serif text-[11px] font-normal text-cloud-dark">(Optional)</span></span>
        </label>
        <Input
          id="reg-email"
          type="email"
          placeholder="you@domain.com (for password recovery)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      {/* Bio / Headline input (optional) */}
      <div className="space-y-1.5">
        <label
          htmlFor="reg-bio"
          className="flex items-center gap-2 font-gothic text-xs font-bold uppercase tracking-wider text-slate-dark"
        >
          <FileText className="w-3.5 h-3.5 text-cloud-dark" />
          <span>Bio / Headline <span className="font-serif text-[11px] font-normal text-cloud-dark">(Optional)</span></span>
        </label>
        <textarea
          id="reg-bio"
          rows={3}
          placeholder="Architectural designer focusing on brutalist aesthetics, monolith concrete, and parametric envelopes..."
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="w-full rounded-xl border border-stone bg-ivory-light px-3.5 py-2.5 font-serif text-xs text-slate-dark placeholder-cloud-dark focus:border-clay focus:outline-none transition-colors"
        />
      </div>

      <div className="pt-3 flex gap-3">
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={onBack}
          leftIcon={<ArrowLeft className="w-4 h-4" />}
          className="font-gothic uppercase tracking-wider text-xs"
        >
          Back
        </Button>
        <Button
          type="submit"
          variant="clay"
          size="lg"
          fullWidth
          rightIcon={<ArrowRight className="w-4 h-4" />}
          className="font-gothic uppercase tracking-wider text-xs justify-center"
        >
          Next: Avatar
        </Button>
      </div>
    </form>
  );
};
