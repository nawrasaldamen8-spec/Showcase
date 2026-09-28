import React from "react";
import { Link } from "react-router-dom";
import { Lock, LogIn, User } from "lucide-react";
import { Button } from "@shared/components/Button.tsx";
import { Input } from "@shared/components/Input.tsx";
import { AuthCardLayout } from "../components/AuthCardLayout.tsx";
import { GoogleAuthButton } from "../components/GoogleAuthButton.tsx";
import { useLoginForm } from "../hooks/useLoginForm.ts";

export const LoginPage: React.FC = () => {
  const {
    emailOrUsername,
    setEmailOrUsername,
    password,
    setPassword,
    isLoading,
    isGoogleLoading,
    error,
    handleSubmit,
    handleGoogleLogin,
  } = useLoginForm();

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
            className="font-gothic font-bold uppercase tracking-wider text-clay hover:underline"
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
            className="flex items-center gap-2 font-gothic text-xs font-bold uppercase tracking-wider text-slate-dark"
          >
            <User className="w-3.5 h-3.5 text-cloud-dark" />
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
            className="flex items-center gap-2 font-gothic text-xs font-bold uppercase tracking-wider text-slate-dark"
          >
            <Lock className="w-3.5 h-3.5 text-cloud-dark" />
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

        {/* Submit */}
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
            Sign In to Studio
          </Button>
        </div>

        {/* Divider */}
        <div className="relative my-4 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-stone/50" />
          </div>
          <span className="relative bg-ivory-light px-3 font-gothic text-[10px] font-bold uppercase tracking-wider text-cloud-dark">
            Or continue with
          </span>
        </div>

        {/* OAuth Buttons */}
        <GoogleAuthButton onClick={handleGoogleLogin} isLoading={isGoogleLoading} />
      </form>
    </AuthCardLayout>
  );
};
