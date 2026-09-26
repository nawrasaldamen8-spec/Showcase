import React, { useState } from 'react';
import { Check, AlertCircle, Save, Undo2, Sparkles, ChevronRight } from 'lucide-react';
import { Input } from '@shared/components/Input.tsx';
import { Textarea } from '@shared/components/Textarea.tsx';
import { Button } from '@shared/components/Button.tsx';
import { useBioEditor } from '../hooks/useBioEditor.ts';
import { SpecialtyPickerModal } from './SpecialtyPickerModal.tsx';

export interface BioEditorProps {
  initialFirstName: string;
  initialLastName: string;
  initialSpecialty?: string | null;
  initialBio?: string | null;
  onProfileUpdated?: (updated: { firstName: string; lastName: string; specialty: string | null; bio: string }) => void;
  onNotify?: (message: string, type?: 'success' | 'error') => void;
}

export const BioEditor: React.FC<BioEditorProps> = (props) => {
  const {
    firstName,
    setFirstName,
    lastName,
    setLastName,
    specialty,
    setSpecialty,
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

  const [isSpecialtyModalOpen, setIsSpecialtyModalOpen] = useState(false);

  return (
    <section aria-labelledby="bio-editor-heading" className="bg-[#faf9f5] rounded-[24px] border border-[#cccbc8]/60 p-6 sm:p-8">
      <div className="border-b border-[#cccbc8]/50 pb-5 mb-6">
        <h2
          id="bio-editor-heading"
          className="font-gothic text-xl sm:text-2xl font-bold uppercase tracking-tight text-[#141413]"
        >
          Profile Details
        </h2>
        <p className="font-serif text-sm sm:text-base text-[#87867f] mt-1 leading-relaxed">
          Your name, primary specialty, and bio displayed on your profile.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Name Fields Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <Input
            label="First Name"
            value={firstName}
            onChange={(e) => {
              setFirstName(e.target.value);
              if (fieldErrors.firstName) {
                setFieldErrors((prev) => ({ ...prev, firstName: undefined }));
              }
            }}
            placeholder="First name"
            errorMessage={fieldErrors.firstName}
            required
            disabled={isSaving}
          />

          <Input
            label="Last Name"
            value={lastName}
            onChange={(e) => {
              setLastName(e.target.value);
              if (fieldErrors.lastName) {
                setFieldErrors((prev) => ({ ...prev, lastName: undefined }));
              }
            }}
            placeholder="Last name"
            errorMessage={fieldErrors.lastName}
            required
            disabled={isSaving}
          />
        </div>

        {/* Creative Discipline / Specialty Selector */}
        <div>
          <label className="block font-gothic text-xs font-bold uppercase tracking-[0.12em] text-[#141413] mb-1.5">
            Primary Specialty / Field
          </label>
          <button
            type="button"
            onClick={() => setIsSpecialtyModalOpen(true)}
            disabled={isSaving}
            className="w-full text-left px-3.5 sm:px-4 py-2.5 sm:py-3 bg-[#f0eee6]/60 hover:bg-[#f0eee6] border border-[#cccbc8] focus:border-[#d97757] rounded-xl flex items-center justify-between gap-2 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <Sparkles className={`w-4 h-4 shrink-0 ${specialty ? 'text-[#d97757]' : 'text-[#87867f]'}`} />
              <span className={`font-serif text-xs sm:text-sm truncate ${specialty ? 'text-[#141413] font-semibold' : 'text-[#87867f]'}`}>
                {specialty || 'Select your specialty (e.g. Software Engineering, UI/UX)...'}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs font-gothic font-bold uppercase tracking-wider text-[#87867f] group-hover:text-[#141413] transition-colors shrink-0">
              <span>{specialty ? 'Change' : 'Choose'}</span>
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </button>
          <p className="mt-1.5 font-serif text-xs text-[#87867f]">
            Displayed in your profile header and across searches.
          </p>

          <SpecialtyPickerModal
            isOpen={isSpecialtyModalOpen}
            onClose={() => setIsSpecialtyModalOpen(false)}
            selectedSpecialty={specialty}
            onSelect={(newSpecialty) => {
              setSpecialty(newSpecialty);
            }}
          />
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
            maxLength={500}
            showCount={true}
            errorMessage={fieldErrors.bio}
            helperText="Brief summary about yourself (max 500 characters)."
            disabled={isSaving}
          />
        </div>

        {/* General Error Banner */}
        {generalError && (
          <div
            role="alert"
            className="flex items-start gap-3 p-4 rounded-xl bg-[#d97757]/10 border border-[#d97757]/40 text-[#141413]"
          >
            <AlertCircle className="h-5 w-5 text-[#d97757] shrink-0 mt-0.5" />
            <div className="text-sm font-serif min-w-0 flex-1">
              <p className="font-gothic font-semibold uppercase tracking-wider text-xs text-[#d97757]">
                Update Encountered an Issue
              </p>
              <p className="mt-0.5 text-[#141413]/90 break-words">{generalError}</p>
            </div>
          </div>
        )}

        {/* Save & Reset Actions Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 pt-3 border-t border-[#cccbc8]/40">
          <div className="flex items-center gap-2">
            {saveSuccess && (
              <span className="inline-flex items-center gap-1.5 font-gothic text-xs font-semibold uppercase tracking-wider text-[#2e7d32] bg-[#2e7d32]/10 px-3 py-1.5 rounded-full animate-in fade-in">
                <Check className="h-3.5 w-3.5 shrink-0" />
                Profile Saved
              </span>
            )}
            {!saveSuccess && hasChanges && (
              <span className="font-gothic text-[11px] uppercase tracking-wider text-[#87867f]">
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
              variant="clay"
              size="md"
              isLoading={isSaving}
              disabled={!hasChanges && !saveSuccess}
              leftIcon={<Save className="h-4 w-4" />}
              className="w-full sm:w-auto justify-center"
            >
              Save Profile
            </Button>
          </div>
        </div>
      </form>
    </section>
  );
};
