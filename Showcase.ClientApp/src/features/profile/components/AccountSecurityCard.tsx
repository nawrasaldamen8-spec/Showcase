import { ShieldCheck } from "lucide-react";
import React from "react";
import { EmailSecuritySection } from "./EmailSecuritySection.tsx";
import { PasswordSecuritySection } from "./PasswordSecuritySection.tsx";
import { UsernameSecuritySection } from "./UsernameSecuritySection.tsx";

export interface AccountSecurityCardProps {
  currentEmail?: string;
  currentUsername?: string;
  onEmailChanged?: (newEmail: string) => void;
  onUsernameChanged?: (newUsername: string) => void;
  onNotify?: (message: string, type?: "success" | "error") => void;
}

export const AccountSecurityCard: React.FC<AccountSecurityCardProps> = ({
  currentEmail = "",
  currentUsername = "",
  onEmailChanged,
  onUsernameChanged,
  onNotify,
}) => {
  return (
    <div className="bg-[#faf9f5] rounded-[24px] border border-[#cccbc8]/60 p-6 sm:p-8 space-y-10">
      <div className="border-b border-[#cccbc8]/50 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-[#f0eee6] border border-[#cccbc8]/70 text-[#141413]">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-gothic text-xl sm:text-2xl font-bold uppercase tracking-tight text-[#141413]">
              Account Security &amp; Credentials
            </h2>
            <p className="font-serif text-sm sm:text-base text-[#87867f] mt-0.5">
              Simulated security controls with RFC 7807 problem details validation and state persistence.
            </p>
          </div>
        </div>
      </div>

      <PasswordSecuritySection onNotify={onNotify} />
      <div className="border-t border-[#cccbc8]/50" />
      <EmailSecuritySection currentEmail={currentEmail} onEmailChanged={onEmailChanged} onNotify={onNotify} />
      <div className="border-t border-[#cccbc8]/50" />
      <UsernameSecuritySection
        currentUsername={currentUsername}
        onUsernameChanged={onUsernameChanged}
        onNotify={onNotify}
      />
    </div>
  );
};
