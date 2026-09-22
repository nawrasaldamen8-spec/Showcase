import React, { useState } from 'react';
import { Check, AlertCircle, Save, Undo2 } from 'lucide-react';
import { Input } from '../../../shared/components/Input.tsx';
import { Textarea } from '../../../shared/components/Textarea.tsx';
import { Button } from '../../../shared/components/Button.tsx';
import { apiClient } from '../../../shared/api/apiClient.ts';
import { useAuth } from '../../../shared/context/useAuth.ts';

export interface BioEditorProps {
  initialFirstName: string;
  initialLastName: string;
  initialBio?: string | null;
  onProfileUpdated?: (updated: { firstName: string; lastName: string; bio: string }) => void;
  onNotify?: (message: string, type?: 'success' | 'error') => void;
}

export const BioEditor: React.FC<BioEditorProps> = ({
  initialFirstName,
  initialLastName,
  initialBio = '',
  onProfileUpdated,
  onNotify,
}) => {
  const { refreshUser } = useAuth();

  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const [bio, setBio] = useState(initialBio || '');

  const [prevProps, setPrevProps] = useState({
    firstName: initialFirstName,
    lastName: initialLastName,
    bio: initialBio || '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    firstName?: string;
    lastName?: string;
    bio?: string;
  }>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync state if initial props change without triggering cascading renders
  if (
    initialFirstName !== prevProps.firstName ||
    initialLastName !== prevProps.lastName ||
    (initialBio || '') !== prevProps.bio
  ) {
    setPrevProps({
      firstName: initialFirstName,
      lastName: initialLastName,
      bio: initialBio || '',
    });
    setFirstName(initialFirstName);
    setLastName(initialLastName);
    setBio(initialBio || '');
  }

  const hasChanges =
    firstName.trim() !== initialFirstName.trim() ||
    lastName.trim() !== initialLastName.trim() ||
    (bio.trim() || '') !== (initialBio?.trim() || '');

  const handleReset = () => {
    setFirstName(initialFirstName);
    setLastName(initialLastName);
    setBio(initialBio || '');
    setFieldErrors({});
    setGeneralError(null);
    setSaveSuccess(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: { firstName?: string; lastName?: string; bio?: string } = {};

    if (!firstName.trim()) {
      errors.firstName = 'First name is required.';
    }
    if (!lastName.trim()) {
      errors.lastName = 'Last name is required.';
    }
    if (bio.length > 500) {
      errors.bio = 'Biography cannot exceed 500 characters.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setGeneralError(null);
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      await apiClient.updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        bio: bio.trim() || null,
      });

      await refreshUser();

      setSaveSuccess(true);
      onProfileUpdated?.({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        bio: bio.trim(),
      });
      onNotify?.('Profile details updated successfully.', 'success');

      // Dismiss inline success indicator after 4 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 4000);
    } catch (err: unknown) {
      const problem = err as { detail?: string; title?: string; errors?: Record<string, string[]> };
      const errorMessage =
        problem?.detail || problem?.title || 'Failed to update profile details. Please try again.';
      setGeneralError(errorMessage);
      onNotify?.(errorMessage, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section aria-labelledby="bio-editor-heading" className="bg-[#faf9f5] rounded-[24px] border border-[#cccbc8]/60 p-6 sm:p-8">
      <div className="border-b border-[#cccbc8]/50 pb-5 mb-6">
        <h2
          id="bio-editor-heading"
          className="font-gothic text-xl sm:text-2xl font-bold uppercase tracking-tight text-[#141413]"
        >
          Editorial Profile Details
        </h2>
        <p className="font-serif text-sm sm:text-base text-[#87867f] mt-1 leading-relaxed">
          Your public name and artist biography displayed across the catalog and your profile exhibition.
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
            placeholder="e.g. Elena"
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
            placeholder="e.g. Vance"
            errorMessage={fieldErrors.lastName}
            required
            disabled={isSaving}
          />
        </div>

        {/* Bio Textarea with live character counter */}
        <div>
          <Textarea
            label="Artist Biography"
            value={bio}
            onChange={(e) => {
              setBio(e.target.value);
              if (fieldErrors.bio) {
                setFieldErrors((prev) => ({ ...prev, bio: undefined }));
              }
            }}
            placeholder="Express your artistic philosophy, medium specialties, studio location, or curated perspective..."
            rows={5}
            maxLength={500}
            showCount={true}
            errorMessage={fieldErrors.bio}
            helperText="Concise summary (max 500 characters) rendered in editorial Anthropic Serif."
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
            <div className="text-sm font-serif">
              <p className="font-gothic font-semibold uppercase tracking-wider text-xs text-[#d97757]">
                Update Encountered an Issue
              </p>
              <p className="mt-0.5 text-[#141413]/90">{generalError}</p>
            </div>
          </div>
        )}

        {/* Save & Reset Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-[#cccbc8]/40">
          <div className="flex items-center gap-2">
            {saveSuccess && (
              <span className="inline-flex items-center gap-1.5 font-gothic text-xs font-semibold uppercase tracking-wider text-[#2e7d32] bg-[#2e7d32]/10 px-3 py-1.5 rounded-full animate-in fade-in">
                <Check className="h-3.5 w-3.5" />
                Profile Saved
              </span>
            )}
            {!saveSuccess && hasChanges && (
              <span className="font-gothic text-[11px] uppercase tracking-wider text-[#87867f]">
                Unsaved modifications
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {hasChanges && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleReset}
                disabled={isSaving}
                leftIcon={<Undo2 className="h-3.5 w-3.5" />}
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
            >
              Save Profile
            </Button>
          </div>
        </div>
      </form>
    </section>
  );
};
