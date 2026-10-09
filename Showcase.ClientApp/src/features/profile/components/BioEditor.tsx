import React from "react";
import { Link } from "react-router-dom";
import { Check, AlertCircle, Save, Undo2, Sparkles, ChevronRight, Globe } from "lucide-react";
import { Input } from "@shared/components/Input.tsx";
import { Textarea } from "@shared/components/Textarea.tsx";
import { Button } from "@shared/components/Button.tsx";
import { useBioEditor } from "../hooks/useBioEditor.ts";

export interface BioEditorProps {
  initialName: string;
  initialSpecialty?: string | null;
  initialCountry?: string | null;
  initialBio?: string | null;
  onProfileUpdated?: (updated: { name: string; specialty: string | null; country: string | null; bio: string }) => void;
}

export const BioEditor: React.FC<BioEditorProps> = (props) => {
  const {
    name,
    setName,
    specialty,
    country,
    bio,
    setBio,
    fieldErrors,
    setFieldErrors,
    generalError,
    saveSuccess,
    hasChanges,
    isSaving,
    handleReset,
    handleSave,
  } = useBioEditor(props);

  return (
    <section aria-labelledby="bio-editor-heading" className="bg-ivory-light rounded-card border border-stone/60 p-6 sm:p-8">
      <div className="border-b border-stone/50 pb-5 mb-6">
        <h2
          id="bio-editor-heading"
          className="font-gothic text-xl sm:text-2xl font-bold uppercase tracking-tight text-slate-dark"
        >
          Profile Details
        </h2>
        <p className="font-serif text-sm sm:text-base text-cloud-dark mt-1 leading-relaxed">
          Your name, country, primary specialty, and bio displayed on your profile.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Name Field */}
        <div>
          <Input
            label="Full Name / Brand"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (fieldErrors.name) {
                setFieldErrors((prev) => ({ ...prev, name: undefined }));
              }
            }}
            placeholder="e.g. Elena Vance or Studio Mono"
            errorMessage={fieldErrors.name}
            required
            disabled={isSaving}
          />
        </div>

        {/* Country Screen Selector Row (Full Width) */}
        <div>
          <label className="block font-gothic text-xs font-bold uppercase tracking-[0.12em] text-slate-dark mb-1.5">
            Country / Region <span className="font-serif text-[11px] font-normal text-cloud-dark">(Optional)</span>
          </label>
          <Link
            to="/profile/edit/country"
            className="w-full text-left px-4 py-3 bg-ivory-medium/60 hover:bg-ivory-medium border border-stone focus:border-clay rounded-xl flex items-center justify-between gap-3 transition-all group text-decoration-none"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Globe className={`w-4 h-4 shrink-0 ${country ? "text-clay" : "text-cloud-dark"}`} />
              <span className={`font-serif text-sm truncate ${country ? "text-slate-dark font-semibold" : "text-cloud-dark"}`}>
                {country || "Select country / region..."}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-gothic font-bold uppercase tracking-wider text-cloud-dark group-hover:text-slate-dark transition-colors shrink-0">
              <span>{country ? "Change" : "Choose"}</span>
              <ChevronRight className="w-4 h-4 text-clay group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>
        </div>

        {/* Specialty Screen Selector Row (Full Width) */}
        <div>
          <label className="block font-gothic text-xs font-bold uppercase tracking-[0.12em] text-slate-dark mb-1.5">
            Primary Specialty <span className="font-serif text-[11px] font-normal text-cloud-dark">(Optional)</span>
          </label>
          <Link
            to="/profile/edit/specialty"
            className="w-full text-left px-4 py-3 bg-ivory-medium/60 hover:bg-ivory-medium border border-stone focus:border-clay rounded-xl flex items-center justify-between gap-3 transition-all group text-decoration-none"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Sparkles className={`w-4 h-4 shrink-0 ${specialty ? "text-clay" : "text-cloud-dark"}`} />
              <span className={`font-serif text-sm truncate ${specialty ? "text-slate-dark font-semibold" : "text-cloud-dark"}`}>
                {specialty || "Select primary specialty..."}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-gothic font-bold uppercase tracking-wider text-cloud-dark group-hover:text-slate-dark transition-colors shrink-0">
              <span>{specialty ? "Change" : "Choose"}</span>
              <ChevronRight className="w-4 h-4 text-clay group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>
        </div>

        {/* Bio Textarea with live character counter */}
        <div>
          <Textarea
            label="Bio"
            value={bio}
            onChange={(e) => {
              setBio(e.target.value);
              if (fieldErrors.bio) {
                setFieldErrors((prev) => ({ ...prev, bio: undefined }));
              }
            }}
            placeholder="Tell us about yourself, your background, and what you do..."
            rows={5}
            maxLength={1000}
            showCount={true}
            errorMessage={fieldErrors.bio}
            helperText="Brief summary about yourself (max 1000 characters)."
            disabled={isSaving}
          />
        </div>

        {/* General Error Banner */}
        {generalError && (
          <div
            role="alert"
            className="flex items-start gap-3 p-4 rounded-xl bg-clay/10 border border-clay/40 text-slate-dark"
          >
            <AlertCircle className="h-5 w-5 text-clay shrink-0 mt-0.5" />
            <div className="text-sm font-serif min-w-0 flex-1">
              <p className="font-gothic font-semibold uppercase tracking-wider text-xs text-clay">
                Update Encountered an Issue
              </p>
              <p className="mt-0.5 text-slate-dark/90 break-words">{generalError}</p>
            </div>
          </div>
        )}

        {/* Save & Reset Actions Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 pt-3 border-t border-stone/40">
          <div className="flex items-center gap-2">
            {saveSuccess && (
              <span className="inline-flex items-center gap-1.5 font-gothic text-xs font-semibold uppercase tracking-wider text-[#2e7d32] bg-[#2e7d32]/10 px-3 py-1.5 rounded-full animate-in fade-in">
                <Check className="h-3.5 w-3.5 shrink-0" />
                Profile Saved
              </span>
            )}
            {!saveSuccess && hasChanges && (
              <span className="font-gothic text-[11px] uppercase tracking-wider text-cloud-dark">
                Unsaved modifications
              </span>
            )}
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
            {hasChanges && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleReset}
                disabled={isSaving}
                leftIcon={<Undo2 className="h-3.5 w-3.5" />}
                className="w-full sm:w-auto justify-center"
              >
                Discard
              </Button>
            )}

            <Button
              type="submit"
              variant={hasChanges ? "clay" : "outline"}
              size="md"
              isLoading={isSaving}
              disabled={!hasChanges && !saveSuccess}
              leftIcon={<Save className="h-4 w-4" />}
              className={`w-full sm:w-auto justify-center ${hasChanges ? "text-ivory-light font-bold" : ""}`}
            >
              {saveSuccess ? "Profile Saved" : "Save Profile"}
            </Button>
          </div>
        </div>
      </form>
    </section>
  );
};
