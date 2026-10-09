import React, { useRef } from "react";
import { Camera, Sparkles } from "lucide-react";
import { Button } from "@shared/components/Button.tsx";
import { UserAvatar } from "@shared/components/media/index.ts";

export interface AvatarUploadStepProps {
  name: string;
  username: string;
  avatarUrl: string;
  onAvatarChange: (url: string) => void;
  onFileSelect?: (file: File) => void;
  onComplete: () => void;
  onSkip: () => void;
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
  onSkip,
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
    <div className="space-y-6 text-center">
      <div className="space-y-1">
        <h3 className="font-gothic text-base font-bold uppercase tracking-tight text-slate-dark">
          Profile Avatar (Optional)
        </h3>
        <p className="font-serif text-xs text-cloud-dark">
          Upload a portrait photo or continue with the default silhouette.
        </p>
      </div>

      {/* Main Avatar Preview */}
      <div className="flex flex-col items-center justify-center gap-3">
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

        <div className="font-serif text-xs text-slate-dark/70">
          {name || `@${username}`}
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
            className="flex-1 font-gothic uppercase tracking-wider text-xs"
          >
            Back
          </Button>

          <Button
            type="button"
            variant="clay"
            size="lg"
            onClick={onComplete}
            isLoading={isLoading}
            leftIcon={<Sparkles className="h-4 w-4" />}
            className="flex-1 font-gothic uppercase tracking-wider text-xs shadow-none"
          >
            {avatarUrl ? "Complete Profile" : "Create Profile"}
          </Button>
        </div>

        {!avatarUrl && (
          <button
            type="button"
            onClick={onSkip}
            disabled={isLoading}
            className="font-serif text-xs text-cloud-dark hover:text-slate-dark underline underline-offset-4 cursor-pointer transition-colors"
          >
            Skip for now, use default avatar
          </button>
        )}
      </div>
    </div>
  );
};
