import { AlertTriangle, ArrowLeft, KeyRound, Laptop, Mail, ShieldAlert, ShieldCheck } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";
import { apiClient } from "@shared/api/apiClient.ts";
import { useAuth } from "@shared/context/useAuth.ts";
import { useAsyncData } from "@shared/hooks/index.ts";
import { SecurityNavRow } from "../components/SecurityNavRow.tsx";

export const SecurityHubPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { data: profile } = useAsyncData(() => apiClient.getMyProfile());

  const displayEmail = profile?.email || currentUser?.email || "elena.vance@studio-vance.design";

  // Read simulated 2FA status from localStorage
  const is2FaEnabled = typeof window !== "undefined" && localStorage.getItem("showcase_2fa_enabled") === "true";

  return (
    <div className="min-h-screen bg-[#f0eee6] py-6 sm:py-10 px-4 sm:px-6 lg:px-8 pb-24">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Back Link to Profile Settings */}
        <div>
          <Link
            to="/settings"
            className="inline-flex items-center gap-2 font-gothic text-xs font-semibold uppercase tracking-[0.14em] text-[#87867f] hover:text-[#141413] transition-colors group text-decoration-none"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span>Settings &amp; Preferences</span>
          </Link>
        </div>

        {/* Page Header */}
        <div className="border-b border-[#cccbc8] pb-6 space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-gothic text-xs font-bold uppercase tracking-[0.16em] text-[#d97757]">
              Security Hub
            </span>
            <span className="text-[#cccbc8]">&bull;</span>
            <span className="font-gothic text-xs font-semibold uppercase tracking-[0.10em] text-[#87867f]">
              Authentication
            </span>
          </div>

          <h1 className="font-gothic font-extrabold text-3xl sm:text-4xl uppercase tracking-tight text-[#141413]">
            Account &amp; Security
          </h1>

          <p className="font-serif text-sm sm:text-base text-[#141413]/75 leading-relaxed">
            Manage your credentials, secondary authentication factors, and active sessions across devices.
          </p>
        </div>

        {/* Section 1: Login & Credentials */}
        <section className="space-y-3.5" aria-labelledby="credentials-heading">
          <div className="px-1">
            <h2
              id="credentials-heading"
              className="font-gothic text-xs font-bold uppercase tracking-[0.14em] text-[#87867f]"
            >
              Login &amp; Credentials
            </h2>
          </div>

          <div className="space-y-3">
            <SecurityNavRow
              to="/settings/security/change-password"
              icon={KeyRound}
              title="Change Password"
              description="Last modified recently • Passphrase authentication"
              badge={
                <span className="px-2 py-0.5 rounded-full text-[10px] font-gothic font-bold uppercase tracking-wider bg-[#2e7d32]/10 text-[#2e7d32] border border-[#2e7d32]/30">
                  Secured
                </span>
              }
            />

            <SecurityNavRow
              to="/settings/security/email"
              icon={Mail}
              title="Email Address"
              description={displayEmail}
              badge={
                <span className="px-2 py-0.5 rounded-full text-[10px] font-gothic font-bold uppercase tracking-wider bg-[#2e7d32]/10 text-[#2e7d32] border border-[#2e7d32]/30">
                  Verified
                </span>
              }
            />
          </div>
        </section>

        {/* Section 2: Enhanced Protection & Devices */}
        <section className="space-y-3.5" aria-labelledby="protection-heading">
          <div className="px-1">
            <h2
              id="protection-heading"
              className="font-gothic text-xs font-bold uppercase tracking-[0.14em] text-[#87867f]"
            >
              Multi-Factor &amp; Device Sessions
            </h2>
          </div>

          <div className="space-y-3">
            <SecurityNavRow
              to="/settings/security/two-factor"
              icon={ShieldCheck}
              title="Two-Factor Authentication (2FA)"
              description="Require an authenticator code when logging into your creator atelier"
              badge={
                is2FaEnabled ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-gothic font-bold uppercase tracking-wider bg-[#2e7d32]/10 text-[#2e7d32] border border-[#2e7d32]/30">
                    Enabled
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-gothic font-bold uppercase tracking-wider bg-[#cccbc8]/30 text-[#87867f] border border-[#cccbc8]">
                    Disabled
                  </span>
                )
              }
            />

            <SecurityNavRow
              to="/settings/security/sessions"
              icon={Laptop}
              title="Active Sessions"
              description="2 authorized client devices currently authenticated"
              badge={
                <span className="px-2 py-0.5 rounded-full text-[10px] font-gothic font-bold uppercase tracking-wider bg-[#faf9f5] border border-[#cccbc8] text-[#141413]">
                  2 Devices
                </span>
              }
            />
          </div>
        </section>

        {/* Section 3: Danger Zone */}
        <section className="space-y-3.5 pt-4 border-t border-[#cccbc8]/60" aria-labelledby="danger-heading">
          <div className="px-1 flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-[#d97757]" />
            <h2
              id="danger-heading"
              className="font-gothic text-xs font-bold uppercase tracking-[0.14em] text-[#d97757]"
            >
              Danger Zone
            </h2>
          </div>

          <SecurityNavRow
            to="/settings/security/delete-account"
            variant="danger"
            icon={AlertTriangle}
            title="Delete or Deactivate Account"
            description="Permanently remove your creator profile, exhibitions, and all uploaded plates"
            badge={
              <span className="px-2 py-0.5 rounded-full text-[10px] font-gothic font-bold uppercase tracking-wider bg-[#d97757]/15 text-[#d97757] border border-[#d97757]/40">
                Permanent
              </span>
            }
          />
        </section>
      </div>
    </div>
  );
};
