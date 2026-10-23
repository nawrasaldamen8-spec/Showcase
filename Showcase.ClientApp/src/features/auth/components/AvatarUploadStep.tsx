import React, { useRef } from "react";
import { ArrowLeft, ArrowRight, Camera, Sparkles } from "lucide-react";
import { Button } from "@shared/components/Button.tsx";
import { UserAvatar } from "@shared/components/UserAvatar.tsx";

export interface AvatarUploadStepProps {
  name: string;
  username: string;
  avatarUrl: string;
  onAvatarChange: (url: string) => void;
  onFileSelect?: (file: File) => void;
  onComplete: () => void;
  onSkip?: () => void;
  onBack: () => void;
  isLoading: boolean;
}

export const AvatarUploadStep: React.FC<AvatarUploadStepProps> = ({
  name,
  username,
  avatarUrl,
  onAvatarChange,
  onFileSelect,
  onComplete,
  onBack,
  isLoading,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    onFileSelect?.(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === "string") {
        onAvatarChange(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4 text-center">
      {/* Avatar Preview */}
      <div className="flex flex-col items-center justify-center gap-2 pt-1">
        <div className="relative group">
          <UserAvatar
            src={avatarUrl}
            alt="Avatar preview"
            size="2xl"
            className="border-2 border-stone shadow-none"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 p-2.5 rounded-full bg-clay text-ivory-light hover:bg-[#c26243] transition-colors cursor-pointer shadow-none"
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

        <div className="font-serif text-xs text-slate-dark/70 mt-1">
          {name || `@${username}`}
        </div>
      </div>

      {/* Navigation & Action Buttons */}
      <div className="pt-2 flex items-center justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          size="md"
          onClick={onBack}
          disabled={isLoading}
          leftIcon={<ArrowLeft className="w-4 h-4" />}
          className="font-gothic uppercase tracking-wider text-xs"
        >
          Back
        </Button>

        <Button
          type="button"
          variant="clay"
          size="md"
          onClick={onComplete}
          isLoading={isLoading}
          rightIcon={
            avatarUrl ? (
              <Sparkles className="h-4 w-4" />
            ) : (
              <ArrowRight className="h-4 w-4" />
            )
          }
          className="font-gothic uppercase tracking-wider text-xs shadow-none"
        >
          {avatarUrl ? "Complete Profile" : "Skip"}
        </Button>
      </div>
    </div>
  );
};
