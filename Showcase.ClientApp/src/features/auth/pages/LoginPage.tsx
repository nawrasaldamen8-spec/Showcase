import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Lock, LogIn, User } from "lucide-react";
import { BrandLogo } from "@shared/components/BrandLogo.tsx";
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
    <div className="min-h-[90vh] flex flex-col justify-center py-4 sm:py-12 px-4 sm:px-6 lg:px-8 selection:bg-clay selection:text-ivory-light bg-[url(/branding/pority-logo.svg)] bg-cover bg-center lg:mt-[43px]">
      <div className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-16 items-center lg:ml-[93.005px]">
        {/* Left Column: Warm Gallery Editorial Showcase (Desktop prominent, Mobile concise) */}
        <div className="lg:col-span-7 space-y-3 sm:space-y-6 lg:ml-[-49px]">
          <div className="inline-block">
            <Link to="/" className="inline-block text-decoration-none group" aria-label="Pority Home">
              <BrandLogo
                variant="full"
                theme="light"
                size="md"
                className="group-hover:opacity-90 transition-opacity"
                textClassName="text-xl sm:text-2xl font-serif font-bold tracking-tight text-slate-dark"
              />
            </Link>
          </div>

          <div className="space-y-2 sm:space-y-4">

            <h1 className="font-gothic font-extrabold text-2xl sm:text-5xl lg:text-[50px]/none uppercase tracking-[-0.03em] text-[#e6e3da] leading-[1.08] sm:leading-[1.05] max-md:ml-0 max-md:text-right max-md:mt-4 w-[603px] -ml-px lg:w-103 lg:ml-[-3px] max-md:w-[355px] max-md:h-3.5">
              Curate Your Built Narrative.
            </h1>

          </div>

          {/* Desktop-only Editorial Features */}
        </div>

        {/* Right Column: Focused Card (Mobile & Desktop ergonomic) */}
        <div className="lg:col-span-5 w-full max-w-md mx-auto">
          <div className="bg-ivory-light rounded-2xl sm:rounded-card border border-stone/60 p-5 sm:p-8 space-y-4 sm:space-y-6 shadow-none lg:-ml-px">
            <header className="border-b border-stone/50 pb-3 sm:pb-5 space-y-1">
              <span className="font-gothic text-[11px] font-bold uppercase tracking-[0.16em] text-clay block">
                Studio Access
              </span>
              <h2 className="font-gothic font-extrabold text-xl sm:text-3xl uppercase tracking-tight text-slate-dark">
                Sign In
              </h2>
            </header>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
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
              <div className="relative my-4 flex items-center justify-center">
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
            <div className="pt-4 border-t border-stone/50 text-center font-serif text-xs text-cloud-dark">
              <span>Don&apos;t have a creator account? </span>
              <Link
                to="/register"
                className="font-gothic font-bold uppercase tracking-wider text-clay hover:underline inline-block mt-1 sm:mt-0"
              >
                Register Portfolio
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
