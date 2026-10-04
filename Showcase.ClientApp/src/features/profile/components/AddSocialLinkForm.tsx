import { Plus } from "lucide-react";
import React, { useState } from "react";
import { Button } from "@shared/components/Button.tsx";
import { Input } from "@shared/components/Input.tsx";
import { PLATFORM_PLACEHOLDERS, SUPPORTED_PLATFORMS, type SupportedPlatform } from "../constants.ts";
import { validateUrl } from "../utils.ts";
import { PlatformIcon } from "./PlatformIcon.tsx";

export interface AddSocialLinkFormProps {
  onAdd: (platform: SupportedPlatform, url: string) => Promise<boolean>;
  isProcessing: boolean;
}

export const AddSocialLinkForm: React.FC<AddSocialLinkFormProps> = ({ onAdd, isProcessing }) => {
  const [platform, setPlatform] = useState<SupportedPlatform>("GitHub");
  const [url, setUrl] = useState("");
  const [addError, setAddError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);

    const validationMsg = validateUrl(url);
    if (validationMsg) {
      setAddError(validationMsg);
      return;
    }

    const success = await onAdd(platform, url.trim());
    if (success) {
      setUrl("");
    }
  };

  return (
    <div className="bg-ivory-medium/50 rounded-2xl border border-stone/50 p-4 sm:p-6 mb-8">
      <h3 className="font-gothic text-xs font-bold uppercase tracking-[0.14em] text-slate-dark mb-4">
        Add New Channel
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col">
          <label
            htmlFor="platform-select"
            className="text-label text-cloud-dark mb-1.5 font-gothic text-[12px] font-semibold uppercase tracking-[0.10em]"
          >
            Platform
          </label>
          <select
            id="platform-select"
            value={platform}
            onChange={(e) => setPlatform(e.target.value as SupportedPlatform)}
            disabled={isProcessing}
            className="w-full bg-ivory-light text-slate-dark font-gothic text-xs font-semibold uppercase tracking-wider border border-stone rounded-xl px-3.5 py-3 outline-none transition-colors duration-150 focus:border-slate-dark disabled:opacity-50 cursor-pointer"
          >
            {SUPPORTED_PLATFORMS.map((plat) => (
              <option key={plat} value={plat}>
                {plat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Input
            label="Target URL (http:// or https://)"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (addError) setAddError(null);
            }}
            placeholder={PLATFORM_PLACEHOLDERS[platform] || "https://..."}
            errorMessage={addError || undefined}
            disabled={isProcessing}
            leftIcon={<PlatformIcon platform={platform} className="h-4 w-4 text-cloud-dark" />}
          />
        </div>

        <div className="flex justify-end pt-1">
          <Button
            type="submit"
            variant="clay"
            size="sm"
            isLoading={isProcessing}
            disabled={!url.trim()}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Add Channel Link
          </Button>
        </div>
      </form>
    </div>
  );
};
