import { Check, Copy, ShieldAlert, ShieldCheck, Smartphone } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@shared/components/Button.tsx";
import { Input } from "@shared/components/Input.tsx";
import { useToast } from "@shared/context/index.ts";
import { SecurityActionLayout } from "../components/SecurityActionLayout.tsx";

const STORAGE_2FA_KEY = "showcase_2fa_enabled";
const SIMULATED_SECRET_KEY = "SHOW-CASE-7K9P-4X2M-VZ89";

export const TwoFactorAuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [isEnabled, setIsEnabled] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(STORAGE_2FA_KEY) === "true";
  });

  const [verificationCode, setVerificationCode] = useState("");
  const [copiedKey, setCopiedKey] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCopyKey = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      void navigator.clipboard.writeText(SIMULATED_SECRET_KEY);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2500);
    }
  };

  const handleEnable2FA = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanCode = verificationCode.trim().replace(/\s+/g, "");
    if (cleanCode.length !== 6 || !/^\d+$/.test(cleanCode)) {
      setError("Please provide a valid 6-digit numeric verification code.");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      localStorage.setItem(STORAGE_2FA_KEY, "true");
      setIsEnabled(true);
      showToast("success", "Two-Factor Authentication has been successfully enabled.");
      navigate("/settings/security");
    }, 600);
  };

  const handleDisable2FA = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      localStorage.removeItem(STORAGE_2FA_KEY);
      setIsEnabled(false);
      showToast("info", "Two-Factor Authentication has been disabled.");
      navigate("/settings/security");
    }, 400);
  };

  return (
    <SecurityActionLayout
      title="Two-Factor Authentication"
      subtitle="Protect your creator portfolio with an additional layer of security beyond your password."
      badge="Multi-Factor"
    >
      <div className="space-y-6">
        {/* Status Callout Banner */}
        <div
          className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
            isEnabled
              ? "bg-[#2e7d32]/10 border-[#2e7d32]/30 text-[#2e7d32]"
              : "bg-[#faf9f5] border-[#cccbc8]/60 text-[#141413]"
          }`}
        >
          <div className="flex items-center gap-3">
            {isEnabled ? (
              <ShieldCheck className="h-6 w-6 text-[#2e7d32] shrink-0" />
            ) : (
              <ShieldAlert className="h-6 w-6 text-[#87867f] shrink-0" />
            )}
            <div>
              <p className="font-gothic text-xs font-bold uppercase tracking-wider">
                Current Status: {isEnabled ? "Active Protection" : "Not Configured"}
              </p>
              <p className="font-serif text-xs opacity-80 mt-0.5">
                {isEnabled
                  ? "Authenticator codes are required on sign in."
                  : "Your account currently relies on single-factor passphrase authorization."}
              </p>
            </div>
          </div>

          <span
            className={`px-2.5 py-1 rounded-full text-[10px] font-gothic font-bold uppercase tracking-wider shrink-0 ${
              isEnabled ? "bg-[#2e7d32] text-[#faf9f5]" : "bg-[#cccbc8]/30 text-[#87867f] border border-[#cccbc8]"
            }`}
          >
            {isEnabled ? "Enabled" : "Disabled"}
          </span>
        </div>

        {isEnabled ? (
          /* Active State: Option to Disable or Review Backup */
          <div className="space-y-5 pt-2">
            <div className="p-4 rounded-xl bg-[#f0eee6] border border-[#cccbc8]/60 space-y-2">
              <h4 className="font-gothic text-xs font-bold uppercase tracking-wider text-[#141413]">
                Authenticator Connected
              </h4>
              <p className="font-serif text-xs text-[#87867f] leading-relaxed">
                Your mobile authenticator app (Google Authenticator, 1Password, or Authy) is registered as your primary
                secondary factor.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              size="lg"
              fullWidth
              isLoading={isLoading}
              onClick={handleDisable2FA}
              className="justify-center font-gothic uppercase tracking-wider text-xs border-[#d97757]/40 text-[#d97757] hover:bg-[#d97757]/10"
            >
              Disable Two-Factor Authentication
            </Button>
          </div>
        ) : (
          /* Setup State: Step by step pairing */
          <form onSubmit={handleEnable2FA} className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-[#87867f]" />
                <h3 className="font-gothic text-xs font-bold uppercase tracking-[0.12em] text-[#141413]">
                  1. Add Secret Key to Authenticator
                </h3>
              </div>

              <div className="p-4 rounded-xl bg-[#f0eee6] border border-[#cccbc8]/60 flex items-center justify-between gap-3">
                <div className="font-mono text-xs sm:text-sm text-[#141413] tracking-wider select-all font-semibold">
                  {SIMULATED_SECRET_KEY}
                </div>
                <button
                  type="button"
                  onClick={handleCopyKey}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#faf9f5] border border-[#cccbc8] hover:border-[#141413] text-xs font-gothic font-bold uppercase tracking-wider text-[#141413] transition-colors cursor-pointer"
                >
                  {copiedKey ? <Check className="h-3.5 w-3.5 text-[#2e7d32]" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedKey ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#87867f]" />
                <h3 className="font-gothic text-xs font-bold uppercase tracking-[0.12em] text-[#141413]">
                  2. Enter 6-Digit Verification Code
                </h3>
              </div>

              <Input
                label="Verification Code"
                type="text"
                maxLength={6}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="000000"
                helperText="Enter the 6-digit temporary code generated by your app."
                required
                disabled={isLoading}
                className="font-mono tracking-widest text-center text-lg"
              />

              {error && (
                <div className="p-3 rounded-lg bg-[#d97757]/10 border border-[#d97757]/30 text-xs font-serif text-[#d97757]">
                  {error}
                </div>
              )}
            </div>

            {/* Action Button: Full-width at the bottom */}
            <div className="pt-2">
              <Button
                type="submit"
                variant="clay"
                size="lg"
                fullWidth
                isLoading={isLoading}
                disabled={verificationCode.trim().length !== 6}
                className="justify-center font-gothic uppercase tracking-wider text-xs shadow-none"
              >
                Enable Two-Factor Authentication
              </Button>
            </div>
          </form>
        )}
      </div>
    </SecurityActionLayout>
  );
};
