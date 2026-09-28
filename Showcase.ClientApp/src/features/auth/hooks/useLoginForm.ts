import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
      navigate("/studio");
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || "Invalid credentials. Please verify your login details.");
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
