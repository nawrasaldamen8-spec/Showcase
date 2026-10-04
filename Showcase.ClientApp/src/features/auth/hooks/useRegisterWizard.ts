import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { apiClient, extractApiErrorMessage } from "@shared/api/index.ts";
import { useAuth, useToast } from "@shared/context/index.ts";

function parseJwtPayload(token: string): { email?: string; name?: string; picture?: string } | null {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function useRegisterWizard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { register, refreshUser } = useAuth();
  const { showToast } = useToast();

  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const oauthToken = searchParams.get("token") || "";
  const isOAuthMode = (searchParams.get("oauth") === "google" || location.pathname.includes("complete-oauth")) && Boolean(oauthToken);

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [specialty, setSpecialty] = useState<string | null>(null);
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Pre-fill state when in OAuth mode from verified token
  useEffect(() => {
    if (isOAuthMode && oauthToken) {
      const payload = parseJwtPayload(oauthToken);
      if (payload) {
        if (payload.email) {
          setEmail(payload.email);
          const firstPart = payload.email.split("@")[0] || "";
          const baseName = firstPart.toLowerCase().replace(/[^a-z0-9_]/g, "_");
          if (!username && baseName) {
            setUsername(baseName);
          }
        }
        if (payload.name && !name) {
          setName(payload.name);
        }
        if (payload.picture && !avatarUrl) {
          setAvatarUrl(payload.picture);
        }
      }
    }
  }, [isOAuthMode, oauthToken]);

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

  // Step 1: Username Handle
  const handleNextFromUsername = (e: React.FormEvent) => {
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

    // In OAuth mode, next step is Email (Step 2). In standard mode, next step is Password (Step 2).
    setCurrentStep(2);
  };

  // Step 2 (Standard only): Password
  const handleNextFromPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setCurrentStep(3);
  };

  // Email Step (Step 2 in OAuth, Step 3 in Standard)
  const handleNextFromEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim();
    if (cleanEmail && !/.+@.+\..+/.test(cleanEmail)) {
      setError("Please enter a valid email address or click Skip.");
      return;
    }

    // Next step is Identity (Step 3 in OAuth, Step 4 in Standard)
    setCurrentStep(isOAuthMode ? 3 : 4);
  };

  const handleSkipEmail = () => {
    setError(null);
    if (!isOAuthMode) {
      setEmail("");
    }
    setCurrentStep(isOAuthMode ? 3 : 4);
  };

  // Identity / Name Step (Step 3 in OAuth, Step 4 in Standard)
  const handleNextFromIdentity = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Please enter your name or practice title.");
      return;
    }

    // Next step is Specialty (Step 4 in OAuth, Step 5 in Standard)
    setCurrentStep(isOAuthMode ? 4 : 5);
  };

  // Specialty Step (Step 4 in OAuth, Step 5 in Standard)
  const handleNextFromSpecialty = (selectedSpecialty?: string | null) => {
    setError(null);
    setSpecialty(selectedSpecialty || null);
    // Next step is Bio (Step 5 in OAuth, Step 6 in Standard)
    setCurrentStep(isOAuthMode ? 5 : 6);
  };

  // Bio Step (Step 5 in OAuth, Step 6 in Standard)
  const handleNextFromBio = () => {
    setError(null);
    // Next step is Avatar (Step 6 in OAuth, Step 7 in Standard)
    setCurrentStep(isOAuthMode ? 6 : 7);
  };

  // Final step: Avatar & Complete Registration -> Redirects to Profile
  const handleCompleteRegistration = async (_customAvatarUrl?: string) => {
    setError(null);
    setIsLoading(true);

    try {
      const finalUsername = username.trim();

      if (isOAuthMode && oauthToken) {
        // Complete Google registration with backend
        await apiClient.registerGoogle({
          token: oauthToken,
          username: finalUsername,
          name: name.trim(),
          specialty: specialty || undefined,
          bio: bio.trim() || undefined,
          pictureUrl: avatarUrl || undefined,
        });

        await refreshUser();
      } else {
        await register({
          username: finalUsername,
          password,
          name: name.trim(),
          email: email.trim() || undefined,
          bio: bio.trim() || undefined,
          specialty: specialty || undefined,
        });
      }

      showToast("success", `Welcome to Pority, ${name.trim()}!`);
      // Redirect newly registered creators directly to their public profile
      navigate(`/u/${encodeURIComponent(finalUsername)}`, { replace: true });
    } catch (err: unknown) {
      setError(extractApiErrorMessage(err, "Registration failed. Please check your information and try again."));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isOAuthMode,
    currentStep,
    setCurrentStep,
    username,
    setUsername,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    email,
    setEmail,
    name,
    setName,
    specialty,
    setSpecialty,
    bio,
    setBio,
    avatarUrl,
    setAvatarUrl,
    usernameStatus,
    error,
    isLoading,
    handleNextFromUsername,
    handleNextFromPassword,
    handleNextFromEmail,
    handleSkipEmail,
    handleNextFromIdentity,
    handleNextFromSpecialty,
    handleNextFromBio,
    handleCompleteRegistration,
  };
}
