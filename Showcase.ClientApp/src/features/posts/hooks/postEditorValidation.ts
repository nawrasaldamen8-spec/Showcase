import type { WizardStepNumber } from "./usePostEditor.ts";

export interface ValidationState {
  imagesCount: number;
  title: string;
  externalUrl: string;
  description: string;
}

export interface ValidationErrors {
  setTitleError: (err: string | null) => void;
  setUrlError: (err: string | null) => void;
  setDescriptionError: (err: string | null) => void;
  setImageInvariantError: (err: string | null) => void;
}

export function getNormalizedUrl(externalUrl: string): string | null {
  if (!externalUrl.trim()) return null;
  let url = externalUrl.trim();
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
  return url;
}

export function validateStep(
  step: WizardStepNumber,
  state: ValidationState,
  errors: ValidationErrors
): boolean {
  if (step === 1) {
    if (state.imagesCount === 0) {
      errors.setImageInvariantError("At least one visual plate is required to proceed.");
      return false;
    }
    errors.setImageInvariantError(null);
    return true;
  }

  if (step === 2) {
    let valid = true;
    if (!state.title.trim() || state.title.trim().length < 3) {
      errors.setTitleError("Artwork title is required and must be at least 3 characters.");
      valid = false;
    } else if (state.title.trim().length > 120) {
      errors.setTitleError("Title cannot exceed 120 characters.");
      valid = false;
    } else {
      errors.setTitleError(null);
    }

    if (state.externalUrl.trim()) {
      const candidate = state.externalUrl.trim().startsWith("http")
        ? state.externalUrl.trim()
        : `https://${state.externalUrl.trim()}`;
      try {
        new URL(candidate);
        errors.setUrlError(null);
      } catch {
        errors.setUrlError("Please enter a valid web URL (e.g. https://domain.com).");
        valid = false;
      }
    } else {
      errors.setUrlError(null);
    }
    return valid;
  }

  if (step === 3) {
    if (!state.description.trim()) {
      errors.setDescriptionError("Exhibition statement is required.");
      return false;
    }
    errors.setDescriptionError(null);
    return true;
  }

  return true;
}

export function validateFullForm(
  state: ValidationState,
  errors: ValidationErrors,
  setCurrentStep: (step: WizardStepNumber) => void
): boolean {
  if (!validateStep(1, state, errors)) {
    setCurrentStep(1);
    return false;
  }
  if (!validateStep(2, state, errors)) {
    setCurrentStep(2);
    return false;
  }
  if (!validateStep(3, state, errors)) {
    setCurrentStep(3);
    return false;
  }
  return true;
}
