import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, LogIn, User } from "lucide-react";
import { Button } from "@shared/components/Button.tsx";
import { Input } from "@shared/components/Input.tsx";
import { useAuth, useToast } from "@shared/context/index.ts";
import { AuthCardLayout } from "../components/AuthCardLayout.tsx";
import { GoogleAuthButton } from "../components/GoogleAuthButton.tsx";

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();

  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <AuthCardLayout
      title="Sign In to Studio"
      subtitle="Access your architectural portfolio, curate milestones, and publish new works."
      badge="Portfolio Access"
      footerContent={
        <p>
          Don&apos;t have an account?{" "}
          <Link
            to="/register"
            className="font-gothic font-bold uppercase tracking-wider text-[#d97757] hover:underline"
          >
            Register Portfolio
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {error && (
          <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl font-serif text-xs text-red-700">
            {error}
          </div>
        )}

        {/* Username or Email */}
        <div className="space-y-1.5">
          <label
            htmlFor="identifier"
            className="flex items-center gap-2 font-gothic text-xs font-bold uppercase tracking-wider text-[#141413]"
          >
            <User className="w-3.5 h-3.5 text-[#87867f]" />
            <span>Email or Username</span>
          </label>
          <Input
            id="identifier"
            type="text"
            placeholder="elena_v or elena@studio-vance.design"
            value={emailOrUsername}
            onChange={(e) => setEmailOrUsername(e.target.value)}
            required
            autoComplete="username"
          />
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label
            htmlFor="password"
            className="flex items-center gap-2 font-gothic text-xs font-bold uppercase tracking-wider text-[#141413]"
          >
            <Lock className="w-3.5 h-3.5 text-[#87867f]" />
            <span>Password</span>
          </label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            variant="clay"
            size="lg"
            fullWidth
            isLoading={isLoading}
            leftIcon={<LogIn className="w-4 h-4" />}
            className="font-gothic uppercase tracking-wider text-xs justify-center"
          >
            Sign In
          </Button>
        </div>
      </form>

      {/* Divider */}
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#cccbc8]/60" />
        </div>
        <div className="relative flex justify-center text-[10px] font-gothic font-bold uppercase tracking-wider">
          <span className="bg-[#faf9f5] px-3 text-[#87867f]">Or Continue With</span>
        </div>
      </div>

      <GoogleAuthButton onClick={handleGoogleLogin} isLoading={isGoogleLoading} />
    </AuthCardLayout>
  );
};
