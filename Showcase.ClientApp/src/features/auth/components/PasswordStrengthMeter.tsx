import React from "react";
import { Check, X } from "lucide-react";

export interface PasswordStrengthMeterProps {
  password: string;
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password }) => {
  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);

  const criteriaCount = [hasMinLength, hasNumber, hasLetter, hasSpecial].filter(Boolean).length;

  let strengthLabel = "Too Short";
  let barColor = "bg-[#cccbc8]";
  let widthPercent = "w-1/4";

  if (password.length > 0) {
    if (criteriaCount <= 1) {
      strengthLabel = "Weak";
      barColor = "bg-red-500";
      widthPercent = "w-1/4";
    } else if (criteriaCount === 2) {
      strengthLabel = "Fair";
      barColor = "bg-[#d97757]";
      widthPercent = "w-2/4";
    } else if (criteriaCount === 3) {
      strengthLabel = "Good";
      barColor = "bg-amber-500";
      widthPercent = "w-3/4";
    } else if (criteriaCount === 4) {
      strengthLabel = "Strong";
      barColor = "bg-[#2e7d32]";
      widthPercent = "w-full";
    }
  }

  if (!password) return null;

  return (
    <div className="space-y-2 pt-1">
      {/* Strength Bar */}
      <div className="flex items-center justify-between">
        <span className="font-gothic text-[10px] font-bold uppercase tracking-wider text-[#87867f]">
          Password Strength
        </span>
        <span
          className={`font-gothic text-[10px] font-bold uppercase tracking-wider ${
            criteriaCount === 4
              ? "text-[#2e7d32]"
              : criteriaCount >= 2
              ? "text-[#d97757]"
              : "text-red-500"
          }`}
        >
          {strengthLabel}
        </span>
      </div>

      <div className="h-1.5 w-full bg-[#e8e5dc] rounded-full overflow-hidden">
        <div className={`h-full ${widthPercent} ${barColor} transition-all duration-300 rounded-full`} />
      </div>

      {/* Checklist */}
      <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px] font-serif text-[#87867f]">
        <div className="flex items-center gap-1.5">
          {hasMinLength ? (
            <Check className="w-3 h-3 text-[#2e7d32]" />
          ) : (
            <X className="w-3 h-3 text-[#cccbc8]" />
          )}
          <span className={hasMinLength ? "text-[#141413]" : ""}>8+ characters</span>
        </div>
        <div className="flex items-center gap-1.5">
          {hasNumber ? (
            <Check className="w-3 h-3 text-[#2e7d32]" />
          ) : (
            <X className="w-3 h-3 text-[#cccbc8]" />
          )}
          <span className={hasNumber ? "text-[#141413]" : ""}>Contains number</span>
        </div>
        <div className="flex items-center gap-1.5">
          {hasLetter ? (
            <Check className="w-3 h-3 text-[#2e7d32]" />
          ) : (
            <X className="w-3 h-3 text-[#cccbc8]" />
          )}
          <span className={hasLetter ? "text-[#141413]" : ""}>Contains letters</span>
        </div>
        <div className="flex items-center gap-1.5">
          {hasSpecial ? (
            <Check className="w-3 h-3 text-[#2e7d32]" />
          ) : (
            <X className="w-3 h-3 text-[#cccbc8]" />
          )}
          <span className={hasSpecial ? "text-[#141413]" : ""}>Special symbol</span>
        </div>
      </div>
    </div>
  );
};
