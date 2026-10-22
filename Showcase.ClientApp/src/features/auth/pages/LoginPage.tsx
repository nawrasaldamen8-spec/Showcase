import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Lock, LogIn, User } from "lucide-react";
import { Button } from "@shared/components/Button.tsx";
import { Input } from "@shared/components/Input.tsx";
import { GoogleAuthButton } from "../components/GoogleAuthButton.tsx";
import { useLoginForm } from "../hooks/useLoginForm.ts";

export const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
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
    <div
      style={{ viewTransitionName: "auth-card" }}
      className="bg-ivory-light rounded-2xl sm:rounded-card border border-stone/60 p-5 sm:p-7 space-y-4 shadow-none overflow-hidden"
    >
      <header className="border-b border-stone/50 pb-3">
        <h2 className="font-gothic font-extrabold text-xl sm:text-2xl uppercase tracking-tight text-slate-dark">
          Sign In
        </h2>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4 kinetic-stagger" noValidate>
        {error && (
          <div
            role="alert"
            className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl font-serif text-xs text-red-700 leading-snug"
          >
            {error}
          </div>
        )}

        {/* Username or Email */}
        <div className="space-y-1.5">
          <Input
            id="identifier"
            label="Email or Username"
            type="text"
            placeholder="e.g. elena_v or elena@studio.design"
            value={emailOrUsername}
            onChange={(e) => setEmailOrUsername(e.target.value)}
            leftIcon={<User className="w-4 h-4" />}
            required
            autoComplete="username"
            enterKeyHint="next"
            className="min-h-[46px]"
          />
        </div>

        {/* Password with Unmask Toggle */}
        <div className="space-y-1.5">
          <Input
            id="password"
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="p-1 text-cloud-dark hover:text-slate-dark transition-colors cursor-pointer focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
            required
            autoComplete="current-password"
            enterKeyHint="go"
            className="min-h-[46px]"
          />
        </div>

        {/* Submit CTA */}
        <div className="pt-2">
          <Button
            type="submit"
            variant="clay"
            size="lg"
            fullWidth
            isLoading={isLoading}
            leftIcon={<LogIn className="w-4 h-4" />}
            className="font-gothic uppercase tracking-wider text-xs justify-center min-h-[48px]"
          >
            Enter Studio
          </Button>
        </div>

        {/* Divider */}
        <div className="relative my-2 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-stone/50" />
          </div>
          <span className="relative bg-ivory-light px-3 font-gothic text-[10px] font-bold uppercase tracking-wider text-cloud-dark">
            Or
          </span>
        </div>

        {/* Google OAuth Button */}
        <GoogleAuthButton onClick={handleGoogleLogin} isLoading={isGoogleLoading} />
      </form>

      {/* Footer Navigation */}
      <div className="-mx-5 sm:-mx-7 -mb-5 sm:-mb-7 px-5 sm:px-7 py-3.5 border-t border-stone/50 text-center font-serif text-xs text-cloud-dark">
        <span>Don&apos;t have a creator account? </span>
        <Link
          to="/register"
          viewTransition
          className="font-gothic font-bold uppercase tracking-wider text-clay hover:underline inline-block mt-1 sm:mt-0"
        >
          Register Portfolio
        </Link>
      </div>
    </div>
  );
};
