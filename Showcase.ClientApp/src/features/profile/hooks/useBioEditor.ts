import React, { useState, useEffect, useRef } from "react";
import { extractApiErrorMessage, extractApiFieldErrors } from "@shared/api/index.ts";
import { useAuth } from "@shared/context/useAuth.ts";
import { useUpdateProfileMutation } from "./useProfileQueries.ts";

export interface UseBioEditorProps {
  initialName: string;
  initialSpecialty?: string | null;
  initialCountry?: string | null;
  initialBio?: string | null;
  onProfileUpdated?: (updated: { name: string; specialty: string | null; country: string | null; bio: string }) => void;
}

export function useBioEditor({
  initialName,
  initialSpecialty = null,
  initialCountry = null,
  initialBio = "",
  onProfileUpdated,
}: UseBioEditorProps) {
  const { refreshUser } = useAuth();
  const updateProfileMutation = useUpdateProfileMutation();

  const [name, setName] = useState(initialName);
  const [specialty, setSpecialty] = useState<string | null>(initialSpecialty || null);
  const [country, setCountry] = useState<string | null>(initialCountry || null);
  const [bio, setBio] = useState(initialBio || "");

  const [prevProps, setPrevProps] = useState({
    name: initialName,
    specialty: initialSpecialty || null,
    country: initialCountry || null,
    bio: initialBio || "",
  });

  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    specialty?: string;
    country?: string;
    bio?: string;
  }>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (successTimerRef.current) {
        clearTimeout(successTimerRef.current);
      }
    };
  }, []);

  if (
    initialName !== prevProps.name ||
    (initialSpecialty || null) !== prevProps.specialty ||
    (initialCountry || null) !== prevProps.country ||
    (initialBio || "") !== prevProps.bio
  ) {
    setPrevProps({
      name: initialName,
      specialty: initialSpecialty || null,
      country: initialCountry || null,
      bio: initialBio || "",
    });
    setName(initialName);
    setSpecialty(initialSpecialty || null);
    setCountry(initialCountry || null);
    setBio(initialBio || "");
  }

  const hasChanges =
    name.trim() !== initialName.trim() ||
    (specialty || null) !== (initialSpecialty || null) ||
    (country?.trim() || null) !== (initialCountry?.trim() || null) ||
    (bio.trim() || "") !== (initialBio?.trim() || "");

  const handleReset = () => {
    setName(initialName);
    setSpecialty(initialSpecialty || null);
    setCountry(initialCountry || null);
    setBio(initialBio || "");
    setFieldErrors({});
    setGeneralError(null);
    setSaveSuccess(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: { name?: string; specialty?: string; country?: string; bio?: string } = {};

    if (!name.trim()) {
      errors.name = "Full name is required.";
    }
    if (bio.length > 1000) {
      errors.bio = "Biography cannot exceed 1000 characters.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setGeneralError(null);
    setSaveSuccess(false);

    try {
      await updateProfileMutation.mutateAsync({
        name: name.trim(),
        specialty: specialty || null,
        country: country?.trim() || null,
        bio: bio.trim() || null,
      });

      await refreshUser();

      setSaveSuccess(true);
      onProfileUpdated?.({
        name: name.trim(),
        specialty: specialty || null,
        country: country?.trim() || null,
        bio: bio.trim(),
      });

      if (successTimerRef.current) {
        clearTimeout(successTimerRef.current);
      }
      successTimerRef.current = setTimeout(() => {
        setSaveSuccess(false);
        successTimerRef.current = null;
      }, 4000);
    } catch (err: unknown) {
      const extractedErrors = extractApiFieldErrors(err);
      if (Object.keys(extractedErrors).length > 0) {
        setFieldErrors(extractedErrors);
      }
      const message = extractApiErrorMessage(err, "Failed to update profile details. Please try again.");
      setGeneralError(message);
    }
  };

  return {
    name,
    setName,
    specialty,
    setSpecialty,
    country,
    setCountry,
    bio,
    setBio,
    fieldErrors,
    setFieldErrors,
    generalError,
    saveSuccess,
    hasChanges,
    isSaving: updateProfileMutation.isPending,
    handleReset,
    handleSave,
  };
}
