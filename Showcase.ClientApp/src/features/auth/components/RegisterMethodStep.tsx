import React from "react";
import { ArrowRight, Mail } from "lucide-react";
import { Button } from "@shared/components/Button.tsx";
import { GoogleAuthButton } from "./GoogleAuthButton.tsx";

export interface RegisterMethodStepProps {
  onSelectStandard: () => void;
  isLoading?: boolean;
}

export const RegisterMethodStep: React.FC<RegisterMethodStepProps> = ({
  onSelectStandard,
  isLoading = false,
}) => {
  const handleGoogleClick = () => {
    window.location.href = "/api/auth/google";
  };

  return (
    <div className="space-y-4 pt-1">
      {/* 1. Google OAuth Option */}
      <GoogleAuthButton
        onClick={handleGoogleClick}
        isLoading={isLoading}
        text="Continue with Google"
      />

      {/* 2. Visual Divider */}
      <div className="relative py-2">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-stone/60" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-ivory-light px-3 text-cloud-dark font-gothic tracking-widest text-[10px] font-bold">
            OR
          </span>
        </div>
      </div>

      {/* 3. Standard Platform Option */}
      <Button
        type="button"
        variant="slate"
        size="lg"
        fullWidth
        leftIcon={<Mail className="w-4 h-4" />}
        rightIcon={<ArrowRight className="w-4 h-4 ml-auto" />}
        onClick={onSelectStandard}
        className="font-gothic uppercase tracking-wider text-xs justify-start px-4 min-h-[48px]"
      >
        <span>Create with Email &amp; Handle</span>
      </Button>
    </div>
  );
};
