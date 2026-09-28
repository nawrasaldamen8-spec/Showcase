import { AlertTriangle, ArrowLeft, AtSign, CheckCircle2, Clock, KeyRound, Mail, Phone, ShieldAlert, ShieldCheck, Sparkles } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";
import { apiClient } from "@shared/api/apiClient.ts";
import { useAuth } from "@shared/context/useAuth.ts";
import { useAsyncData } from "@shared/hooks/index.ts";
import { SecurityNavRow } from "../components/SecurityNavRow.tsx";

export const SecurityHubPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { data: profile } = useAsyncData(() => apiClient.getMyProfile());

  const displayUsername = profile?.username || currentUser?.username || "user";
  const displayEmail = profile?.email || currentUser?.email || "user@pority.com";
  const displayPhone = profile?.phoneNumber || currentUser?.phoneNumber;
  const isVerified = profile?.isVerified ?? currentUser?.isVerified ?? false;
  const verificationStatus = profile?.verificationStatus ?? currentUser?.verificationStatus ?? (isVerified ? "verified" : "none");
  const featuredStatus = profile?.featuredStatus ?? currentUser?.featuredStatus ?? "none";

  return (
    <div className="min-h-screen bg-ivory-medium py-6 sm:py-10 px-4 sm:px-6 lg:px-8 pb-24">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Back Link to Creator Studio */}
        <div>
          <Link
            to="/studio"
            className="inline-flex items-center gap-2 font-gothic text-xs font-semibold uppercase tracking-[0.14em] text-cloud-dark hover:text-slate-dark transition-colors group text-decoration-none"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span>Studio</span>
          </Link>
        </div>

        {/* Page Header */}
        <div className="border-b border-stone pb-6 space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-gothic text-xs font-bold uppercase tracking-[0.16em] text-clay">
              Account Settings
            </span>
            <span className="text-stone">&bull;</span>
            <span className="font-gothic text-xs font-semibold uppercase tracking-[0.10em] text-cloud-dark">
              Security &amp; Identity
            </span>
          </div>

          <h1 className="font-gothic font-extrabold text-3xl sm:text-4xl uppercase tracking-tight text-slate-dark">
            Account Settings
          </h1>

          <p className="font-serif text-sm sm:text-base text-slate-dark/75 leading-relaxed">
            Manage your credentials, contact information, and account verification status.
          </p>
        </div>

        {/* Section 1: Account Information */}
        <section className="space-y-3.5" aria-labelledby="account-info-heading">
          <div className="px-1">
            <h2
              id="account-info-heading"
              className="font-gothic text-xs font-bold uppercase tracking-[0.14em] text-cloud-dark"
            >
              Account Information
            </h2>
          </div>

          <div className="space-y-3">
            {/* 1. Change Username */}
            <SecurityNavRow
              to="/settings/security/username"
              icon={AtSign}
              title="Change Username"
              description={`@${displayUsername}`}
              badge={
                <span className="px-2 py-0.5 rounded-full text-[10px] font-gothic font-bold uppercase tracking-wider bg-ivory-light border border-stone text-slate-dark">
                  Handle
                </span>
              }
            />

            {/* 2. Change Email */}
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

            {/* 3. Phone Number */}
            <SecurityNavRow
              to="/settings/security/phone"
              icon={Phone}
              title="Phone Number"
              description={displayPhone || "Add phone number"}
              badge={
                displayPhone ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-gothic font-bold uppercase tracking-wider bg-[#2e7d32]/10 text-[#2e7d32] border border-[#2e7d32]/30">
                    Linked
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-gothic font-bold uppercase tracking-wider bg-stone/30 text-cloud-dark border border-stone">
                    Optional
                  </span>
                )
              }
            />

            {/* 4. Change Password */}
            <SecurityNavRow
              to="/settings/security/change-password"
              icon={KeyRound}
              title="Change Password"
              description="Update your secret credentials"
              badge={
                <span className="px-2 py-0.5 rounded-full text-[10px] font-gothic font-bold uppercase tracking-wider bg-[#2e7d32]/10 text-[#2e7d32] border border-[#2e7d32]/30">
                  Secured
                </span>
              }
            />
          </div>
        </section>

        {/* Section 2: Verification */}
        <section className="space-y-3.5" aria-labelledby="verification-heading">
          <div className="px-1">
            <h2
              id="verification-heading"
              className="font-gothic text-xs font-bold uppercase tracking-[0.14em] text-cloud-dark"
            >
              Account Verification
            </h2>
          </div>

          <div className="space-y-3">
            {/* 5. Request Account Verification */}
            <SecurityNavRow
              to="/settings/security/verification"
              icon={ShieldCheck}
              title="Account Verification"
              description="Obtain the official verified badge next to your name"
              badge={
                isVerified || verificationStatus === "verified" ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-gothic font-bold uppercase tracking-wider bg-clay/15 text-clay border border-clay/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Verified
                  </span>
                ) : verificationStatus === "pending" ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-gothic font-bold uppercase tracking-wider bg-clay/15 text-clay border border-clay/40 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Pending
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-gothic font-bold uppercase tracking-wider bg-ivory-light border border-stone text-cloud-dark">
                    Apply
                  </span>
                )
              }
            />

            {/* 6. Request Featured Suggestions */}
            <SecurityNavRow
              to="/settings/security/featured"
              icon={Sparkles}
              title="Featured Suggestions Request"
              description="Apply to be highlighted in discovery feeds and suggested creators"
              badge={
                featuredStatus === "featured" ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-gothic font-bold uppercase tracking-wider bg-[#2e7d32]/10 text-[#2e7d32] border border-[#2e7d32]/30 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Featured
                  </span>
                ) : featuredStatus === "pending" ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-gothic font-bold uppercase tracking-wider bg-clay/15 text-clay border border-clay/40 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Pending
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-gothic font-bold uppercase tracking-wider bg-ivory-light border border-stone text-cloud-dark">
                    Apply
                  </span>
                )
              }
            />
          </div>
        </section>

        {/* Section 3: Danger Zone */}
        <section className="space-y-3.5 pt-4 border-t border-stone/60" aria-labelledby="danger-heading">
          <div className="px-1 flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-clay" />
            <h2
              id="danger-heading"
              className="font-gothic text-xs font-bold uppercase tracking-[0.14em] text-clay"
            >
              Danger Zone
            </h2>
          </div>

          {/* 6. Delete Account */}
          <SecurityNavRow
            to="/settings/security/delete-account"
            variant="danger"
            icon={AlertTriangle}
            title="Delete or Deactivate Account"
            description="Permanently remove your account, profile, and all published works"
            badge={
              <span className="px-2 py-0.5 rounded-full text-[10px] font-gothic font-bold uppercase tracking-wider bg-clay/15 text-clay border border-clay/40">
                Permanent
              </span>
            }
          />
        </section>
      </div>
    </div>
  );
};
