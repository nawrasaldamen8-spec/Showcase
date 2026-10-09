import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { extractApiErrorMessage } from "@shared/api/index.ts";
import { useAuth } from "@shared/context/index.ts";

export function useLoginForm() {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const errorParam = params.get("error");
    if (errorParam) {
      const decoded = decodeURIComponent(errorParam);
      if (decoded === "access_denied" || decoded.includes("cancelled")) {
        setError("Google sign-in was cancelled or access was denied.");
      } else {
        setError(decoded);
      }
    }
  }, [location.search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const identifier = emailOrUsername.trim();
    if (!identifier || !password) {
      setError("Please provide both your email/username and password.");
      return;
    }

    setIsLoading(true);
    try {
      await login({ emailOrUsername: identifier, password });
      toast.success("Welcome back to Pority.");
      
      const fromState = location.state as { from?: { pathname: string; search?: string } | string } | null;
      let targetPath = "/feed";
      if (typeof fromState?.from === "string") {
        targetPath = fromState.from;
      } else if (fromState?.from?.pathname) {
        targetPath = `${fromState.from.pathname}${fromState.from.search || ""}`;
      }

      navigate(targetPath, { replace: true });
    } catch (err: unknown) {
      setError(extractApiErrorMessage(err, "Invalid username/email or password. Please verify your credentials."));
    } finally {
      setIsLoading(false);
    }
  };


  const handleGoogleLogin = () => {
    setIsGoogleLoading(true);
    const fromState = location.state as { from?: { pathname: string; search?: string } | string } | null;
    let targetPath = "/feed";
    if (typeof fromState?.from === "string") {
      targetPath = fromState.from;
    } else if (fromState?.from?.pathname) {
      targetPath = `${fromState.from.pathname}${fromState.from.search || ""}`;
    }

    window.location.href = `/api/auth/google?returnUrl=${encodeURIComponent(targetPath)}`;
  };

  return {
    emailOrUsername,
    setEmailOrUsername,
    password,
    setPassword,
    isLoading,
    isGoogleLoading,
    error,
    handleSubmit,
    handleGoogleLogin,
  };
}
