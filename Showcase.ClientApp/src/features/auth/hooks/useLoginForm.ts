import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { extractApiErrorMessage } from "@shared/api/index.ts";
import { useAuth, useToast } from "@shared/context/index.ts";

export function useLoginForm() {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

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
      showToast("success", "Welcome back to Pority Studio.");
      
      const fromState = location.state as { from?: { pathname: string; search?: string } } | null;
      const targetPath = fromState?.from?.pathname
        ? `${fromState.from.pathname}${fromState.from.search || ""}`
        : "/studio";

      navigate(targetPath, { replace: true });
    } catch (err: unknown) {
      setError(extractApiErrorMessage(err, "Invalid username/email or password. Please verify your credentials."));
    } finally {
      setIsLoading(false);
    }
  };


  const handleGoogleLogin = () => {
    setIsGoogleLoading(true);
    setTimeout(() => {
      setIsGoogleLoading(false);
      navigate("/auth/complete-oauth");
    }, 600);
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
