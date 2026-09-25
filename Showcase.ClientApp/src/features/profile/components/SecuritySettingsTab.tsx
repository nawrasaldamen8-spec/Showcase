import { AlertTriangle, KeyRound, Laptop, Mail, ShieldCheck } from "lucide-react";
import React from "react";
import { SecurityNavRow } from "../../security/index.ts";

export interface SecuritySettingsTabProps {
  email?: string;
}

export const SecuritySettingsTab: React.FC<SecuritySettingsTabProps> = ({ email }) => {
  return (
    <div className="space-y-6">
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
          description={email || "Not specified"}
          badge={
            <span className="px-2 py-0.5 rounded-full text-[10px] font-gothic font-bold uppercase tracking-wider bg-[#2e7d32]/10 text-[#2e7d32] border border-[#2e7d32]/30">
              Verified
            </span>
          }
        />

        <SecurityNavRow
          to="/settings/security/two-factor"
          icon={ShieldCheck}
          title="Two-Factor Authentication (2FA)"
          description="Require an authenticator code when logging into your creator atelier"
          badge={
            <span className="px-2 py-0.5 rounded-full text-[10px] font-gothic font-bold uppercase tracking-wider bg-[#cccbc8]/30 text-[#87867f] border border-[#cccbc8]">
              Configured
            </span>
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

      <div className="pt-4 border-t border-[#cccbc8]/60">
        <SecurityNavRow
          to="/settings/security/delete-account"
          variant="danger"
          icon={AlertTriangle}
          title="Delete or Deactivate Account"
          description="Permanently withdraw your creator membership and portfolio records"
          badge={
            <span className="px-2 py-0.5 rounded-full text-[10px] font-gothic font-bold uppercase tracking-wider bg-[#d97757]/15 text-[#d97757] border border-[#d97757]/40">
              Permanent
            </span>
          }
        />
      </div>
    </div>
  );
};
