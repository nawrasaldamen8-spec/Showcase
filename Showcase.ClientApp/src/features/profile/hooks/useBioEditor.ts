import { useState } from 'react';
import { apiClient } from '@shared/api/apiClient.ts';
import { useAuth } from '@shared/context/useAuth.ts';

export interface UseBioEditorProps {
  initialFirstName: string;
  initialLastName: string;
  initialBio?: string | null;
  onProfileUpdated?: (updated: { firstName: string; lastName: string; bio: string }) => void;
  onNotify?: (message: string, type?: 'success' | 'error') => void;
}

export function useBioEditor({
  initialFirstName,
  initialLastName,
  initialBio = '',
  onProfileUpdated,
  onNotify,
}: UseBioEditorProps) {
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

  return {
    firstName,
    setFirstName,
    lastName,
    setLastName,
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
  };
}
