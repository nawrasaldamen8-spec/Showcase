import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "@shared/api/apiClient.ts";
import { useAuth, useToast } from "@shared/context/index.ts";

export function useRegisterWizard() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { showToast } = useToast();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Live username availability check via apiClient
  useEffect(() => {
    const trimmed = username.trim().toLowerCase();
    if (!trimmed || trimmed.length < 3) {
      const timer = setTimeout(() => {
        setUsernameStatus("idle");
      }, 0);
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(async () => {
      setUsernameStatus("checking");
      try {
        const isAvailable = await apiClient.checkUsernameAvailability(trimmed);
        setUsernameStatus(isAvailable ? "available" : "taken");
      } catch {
        setUsernameStatus("available");
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [username]);

  // Step 1 validation: Credentials only (Username & Passwords)
  const handleNextFromStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanUsername = username.trim();

    if (!cleanUsername || cleanUsername.length < 3) {
      setError("Username must be at least 3 characters.");
      return;
    }
    if (usernameStatus === "taken") {
      setError("This username handle is already in use.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setCurrentStep(2);
  };

  // Step 2 validation: Name (Required), Email (Optional format check)
  const handleNextFromStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Please enter your name or studio title.");
      return;
    }

    const cleanEmail = email.trim();
    if (cleanEmail && !/.+@.+\..+/.test(cleanEmail)) {
      setError("Please enter a valid email address, or leave it blank.");
      return;
    }

    setCurrentStep(3);
  };

  // Step 3: Complete registration
  const handleCompleteRegistration = async (customAvatarUrl?: string) => {
    setError(null);
    setIsLoading(true);

    try {
      await register({
        username: username.trim(),
        password,
        name: name.trim(),
        email: email.trim() || undefined,
        bio: bio.trim() || undefined,
        avatarUrl: customAvatarUrl !== undefined ? customAvatarUrl : (avatarUrl || undefined),
      });

      showToast("success", `Welcome to Pority, ${name.trim()}!`);
      navigate("/studio");
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    currentStep,
    setCurrentStep,
    username,
    setUsername,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    name,
    setName,
    email,
    setEmail,
    bio,
    setBio,
    avatarUrl,
    setAvatarUrl,
    usernameStatus,
    error,
    isLoading,
    handleNextFromStep1,
    handleNextFromStep2,
    handleCompleteRegistration,
  };
}
