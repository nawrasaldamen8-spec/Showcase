import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  AtSign,
  CheckCircle2,
  FileText,
  Lock,
  Mail,
  User,
  XCircle,
} from "lucide-react";
import { mockDb } from "@shared/api/mockDb.ts";
import { Button } from "@shared/components/Button.tsx";
import { Input } from "@shared/components/Input.tsx";
import { useAuth, useToast } from "@shared/context/index.ts";
import { AuthCardLayout } from "../components/AuthCardLayout.tsx";
import { AvatarUploadStep } from "../components/AvatarUploadStep.tsx";
import { PasswordStrengthMeter } from "../components/PasswordStrengthMeter.tsx";
import { StepIndicator, type StepItem } from "../components/StepIndicator.tsx";

const WIZARD_STEPS: StepItem[] = [
  { number: 1, label: "Credentials", sublabel: "Account Access" },
  { number: 2, label: "Personal", sublabel: "Name & Bio" },
  { number: 3, label: "Avatar", sublabel: "Profile Image" },
];

export const RegisterWizardPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { showToast } = useToast();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Live username availability check
  useEffect(() => {
    const trimmed = username.trim().toLowerCase();
    if (!trimmed || trimmed.length < 3) {
      const timer = setTimeout(() => {
        setUsernameStatus("idle");
      }, 0);
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(() => {
      try {
        const db = mockDb.loadDb();
        const isTaken = db.users.some((u) => u.username.toLowerCase() === trimmed);
        setUsernameStatus(isTaken ? "taken" : "available");
      } catch {
        setUsernameStatus("available");
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [username]);

  // Step 1 validation: Username, Email, Password, Confirm Password
  const handleNextFromStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanUsername = username.trim();
    const cleanEmail = email.trim();

    if (!cleanUsername || cleanUsername.length < 3) {
      setError("Username must be at least 3 characters.");
      return;
    }
    if (usernameStatus === "taken") {
      setError("This username handle is already in use.");
      return;
    }
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setError("Please enter a valid email address.");
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

  // Step 2 validation: First Name, Last Name, Bio (optional)
  const handleNextFromStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!firstName.trim()) {
      setError("Please enter your first name.");
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
        email: email.trim(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        bio: bio.trim() || undefined,
        avatarUrl: customAvatarUrl !== undefined ? customAvatarUrl : (avatarUrl || undefined),
      });

      showToast("success", `Welcome to Pority, ${firstName.trim()}!`);
      navigate("/studio");
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCardLayout
      title="Create Creator Account"
      subtitle="Join the curated platform for architectural portfolios and career milestones."
      badge="Onboarding Wizard"
      footerContent={
        <p>
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-gothic font-bold uppercase tracking-wider text-[#d97757] hover:underline"
          >
            Sign In
          </Link>
        </p>
      }
    >
      <StepIndicator currentStep={currentStep} steps={WIZARD_STEPS} />

      {error && (
        <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl font-serif text-xs text-red-700">
          {error}
        </div>
      )}

      {/* Step 1: Account Credentials */}
      {currentStep === 1 && (
        <form onSubmit={handleNextFromStep1} className="space-y-4" noValidate>
          {/* Username */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="reg-username"
                className="flex items-center gap-2 font-gothic text-xs font-bold uppercase tracking-wider text-[#141413]"
              >
                <AtSign className="w-3.5 h-3.5 text-[#87867f]" />
                <span>Username Handle <span className="text-[#d97757]">*</span></span>
              </label>
              {usernameStatus === "available" && (
                <span className="inline-flex items-center gap-1 font-serif text-[11px] text-[#2e7d32]">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Available
                </span>
              )}
              {usernameStatus === "taken" && (
                <span className="inline-flex items-center gap-1 font-serif text-[11px] text-red-600">
                  <XCircle className="w-3.5 h-3.5" /> Already taken
                </span>
              )}
            </div>
            <Input
              id="reg-username"
              type="text"
              placeholder="e.g. arch_vance"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
              required
              autoFocus
            />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label
              htmlFor="reg-email"
              className="flex items-center gap-2 font-gothic text-xs font-bold uppercase tracking-wider text-[#141413]"
            >
              <Mail className="w-3.5 h-3.5 text-[#87867f]" />
              <span>Email Address <span className="text-[#d97757]">*</span></span>
            </label>
            <Input
              id="reg-email"
              type="email"
              placeholder="you@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label
              htmlFor="reg-password"
              className="flex items-center gap-2 font-gothic text-xs font-bold uppercase tracking-wider text-[#141413]"
            >
              <Lock className="w-3.5 h-3.5 text-[#87867f]" />
              <span>Password <span className="text-[#d97757]">*</span></span>
            </label>
            <Input
              id="reg-password"
              type="password"
              placeholder="Minimum 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <PasswordStrengthMeter password={password} />
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label
              htmlFor="reg-confirm-password"
              className="flex items-center gap-2 font-gothic text-xs font-bold uppercase tracking-wider text-[#141413]"
            >
              <Lock className="w-3.5 h-3.5 text-[#87867f]" />
              <span>Confirm Password <span className="text-[#d97757]">*</span></span>
            </label>
            <Input
              id="reg-confirm-password"
              type="password"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <div className="pt-3">
            <Button
              type="submit"
              variant="clay"
              size="lg"
              fullWidth
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="font-gothic uppercase tracking-wider text-xs justify-center"
            >
              Next: Personal Information
            </Button>
          </div>
        </form>
      )}

      {/* Step 2: Personal Information */}
      {currentStep === 2 && (
        <form onSubmit={handleNextFromStep2} className="space-y-4" noValidate>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label
                htmlFor="first-name"
                className="flex items-center gap-2 font-gothic text-xs font-bold uppercase tracking-wider text-[#141413]"
              >
                <User className="w-3.5 h-3.5 text-[#87867f]" />
                <span>First Name <span className="text-[#d97757]">*</span></span>
              </label>
              <Input
                id="first-name"
                type="text"
                placeholder="Elena"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="last-name"
                className="flex items-center gap-2 font-gothic text-xs font-bold uppercase tracking-wider text-[#141413]"
              >
                <User className="w-3.5 h-3.5 text-[#87867f]" />
                <span>Last Name</span>
              </label>
              <Input
                id="last-name"
                type="text"
                placeholder="Vance"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>

          {/* Bio / Headline input (optional) */}
          <div className="space-y-1.5">
            <label
              htmlFor="reg-bio"
              className="flex items-center gap-2 font-gothic text-xs font-bold uppercase tracking-wider text-[#141413]"
            >
              <FileText className="w-3.5 h-3.5 text-[#87867f]" />
              <span>Bio / Headline <span className="font-serif text-[11px] font-normal text-[#87867f]">(Optional)</span></span>
            </label>
            <textarea
              id="reg-bio"
              rows={3}
              placeholder="Architectural designer focusing on brutalist aesthetics, monolith concrete, and parametric envelopes..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full rounded-xl border border-[#cccbc8] bg-[#faf9f5] px-3.5 py-2.5 font-serif text-xs text-[#141413] placeholder-[#87867f] focus:border-[#d97757] focus:outline-none transition-colors"
            />
          </div>

          <div className="pt-3 flex gap-3">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => setCurrentStep(1)}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
              className="font-gothic uppercase tracking-wider text-xs"
            >
              Back
            </Button>
            <Button
              type="submit"
              variant="clay"
              size="lg"
              fullWidth
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="font-gothic uppercase tracking-wider text-xs justify-center"
            >
              Next: Avatar
            </Button>
          </div>
        </form>
      )}

      {/* Step 3: Avatar (Optional) */}
      {currentStep === 3 && (
        <AvatarUploadStep
          firstName={firstName}
          lastName={lastName}
          username={username}
          avatarUrl={avatarUrl}
          onAvatarChange={setAvatarUrl}
          onComplete={() => handleCompleteRegistration(avatarUrl)}
          onSkip={() => handleCompleteRegistration("")}
          onBack={() => setCurrentStep(2)}
          isLoading={isLoading}
        />
      )}
    </AuthCardLayout>
  );
};
