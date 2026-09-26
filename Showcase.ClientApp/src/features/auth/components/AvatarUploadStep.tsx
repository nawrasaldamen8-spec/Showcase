import React, { useRef } from "react";
import { Camera, Sparkles } from "lucide-react";
import { Button } from "@shared/components/Button.tsx";

export interface AvatarUploadStepProps {
  firstName: string;
  lastName: string;
  username: string;
  avatarUrl: string;
  onAvatarChange: (url: string) => void;
  onComplete: () => void;
  onSkip: () => void;
  onBack: () => void;
  isLoading: boolean;
}

export const AvatarUploadStep: React.FC<AvatarUploadStepProps> = ({
  firstName,
  lastName,
  username,
  avatarUrl,
  onAvatarChange,
  onComplete,
  onSkip,
  onBack,
  isLoading,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initialLetter = (firstName?.[0] || username?.[0] || "P").toUpperCase();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === "string") {
        onAvatarChange(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6 text-center">
      <div className="space-y-1">
        <h3 className="font-gothic text-base font-bold uppercase tracking-tight text-[#141413]">
          Profile Avatar (Optional)
        </h3>
        <p className="font-serif text-xs text-[#87867f]">
          Upload a portrait photo or use your default initial monogram.
        </p>
      </div>

      {/* Main Avatar Preview */}
      <div className="flex flex-col items-center justify-center gap-3">
        <div className="relative group">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Avatar preview"
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-2 border-[#141413] shadow-none"
            />
          ) : (
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#141413] text-[#faf9f5] flex items-center justify-center font-gothic text-3xl font-extrabold uppercase border-2 border-[#cccbc8]">
              {initialLetter}
            </div>
          )}

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 p-2.5 rounded-full bg-[#d97757] text-[#faf9f5] hover:bg-[#c26243] transition-colors cursor-pointer shadow-none"
            title="Upload portrait photo"
            aria-label="Upload portrait photo"
          >
            <Camera className="w-4 h-4" />
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        <div className="font-serif text-xs text-[#141413]/70">
          {firstName ? `${firstName} ${lastName}` : `@${username}`}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-2 space-y-3">
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={onBack}
            disabled={isLoading}
            className="font-gothic uppercase tracking-wider text-xs"
          >
            Back
          </Button>
          <Button
            type="button"
            variant="clay"
            size="lg"
            fullWidth
            isLoading={isLoading}
            onClick={onComplete}
            leftIcon={<Sparkles className="w-4 h-4" />}
            className="font-gothic uppercase tracking-wider text-xs justify-center"
          >
            Complete Registration
          </Button>
        </div>

        <button
          type="button"
          onClick={onSkip}
          disabled={isLoading}
          className="w-full py-2 font-serif text-xs text-[#87867f] hover:text-[#141413] transition-colors cursor-pointer"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
};
