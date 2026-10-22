import React, { useState } from "react";
import { Check, Copy, Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@shared/components/Button.tsx";
import { Modal } from "@shared/components/Modal.tsx";
import type { PublicProfileResponse } from "@shared/types/index.ts";
import { getOptimizedImageUrl } from "@shared/utils/mediaUrl.ts";
import { ProfileShareCard } from "./ProfileShareCard.tsx";

export interface ShareProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: PublicProfileResponse;
  worksCount?: number;
  isOwnProfile?: boolean;
}

export const ShareProfileModal: React.FC<ShareProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  isOwnProfile = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const displayUrl = `pority.me/u/${profile.username}`;
  const fullShareUrl = `https://pority.me/u/${profile.username}`;

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(fullShareUrl);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = fullShareUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      toast.success(`Profile link copied: ${displayUrl}`);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      toast.error("Unable to copy profile link.");
    }
  };

  const handleSaveCardImage = async () => {
    setIsDownloading(true);
    try {
      // Ensure web fonts are fully rendered before canvas draws
      if (document.fonts?.ready) {
        try {
          await document.fonts.ready;
        } catch {
          // Continue if fonts ready check fails
        }
      }

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas context unavailable");

      const width = 760;
      const avatarSize = 96;
      const padding = 44;

      // Wrap bio text in advance to determine exact dynamic height
      const bioLines: string[] = [];
      const hasBio = Boolean(profile.bio && profile.bio.trim() !== "");
      if (hasBio) {
        ctx.font = '15px "Newsreader", Georgia, serif';
        const maxBioWidth = width - padding * 2;
        const words = profile.bio!.trim().split(" ");
        let currentLine = "";

        for (let i = 0; i < words.length; i++) {
          const word = words[i] ?? "";
          const testLine = currentLine ? `${currentLine} ${word}` : word;
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxBioWidth && i > 0) {
            bioLines.push(currentLine);
            currentLine = word;
            if (bioLines.length >= 4) {
              currentLine += "...";
              break;
            }
          } else {
            currentLine = testLine;
          }
        }
        if (currentLine && bioLines.length < 4) {
          bioLines.push(currentLine);
        }
      }

      // Calculate harmonious height
      const identityBlockHeight = 110;
      const bioHeight = bioLines.length > 0 ? 20 + bioLines.length * 24 : 0;
      const height = Math.max(260, 100 + identityBlockHeight + bioHeight + padding);

      // Retina 3x scale for ultra crisp vector and text rendering
      const scale = 3;
      canvas.width = width * scale;
      canvas.height = height * scale;
      ctx.scale(scale, scale);

      // 1. Card Background
      ctx.fillStyle = "#FAF9F5"; // Ivory Light
      ctx.beginPath();
      ctx.roundRect(0, 0, width, height, 24);
      ctx.fill();

      // Card Border
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = "#CCCBC8"; // Stone
      ctx.stroke();

      // 2. Draw Pority Logo Symbol Alone at Top (Above the Avatar)
      ctx.save();
      ctx.translate(padding, 36);
      ctx.scale(0.28, 0.28);
      ctx.fillStyle = "#141413";

      // Left Lower Pillar
      ctx.beginPath();
      ctx.roundRect(5, 44, 28, 72, 0.5);
      ctx.fill();

      // Main Arch Structure
      const archPath = new Path2D("M 35 4 H 95 V 76 H 68 V 36 C 68 20, 35 20, 35 36 Z");
      ctx.fill(archPath);

      // Lower Right Column / Step
      ctx.beginPath();
      ctx.roundRect(51, 78, 17, 38, 0.5);
      ctx.fill();

      ctx.restore();

      // 3. Avatar Section
      const avatarX = padding;
      const avatarY = 88;
      const avatarRadius = avatarSize / 2;
      const avatarCenterX = avatarX + avatarRadius;
      const avatarCenterY = avatarY + avatarRadius;

      const drawAvatar = async (): Promise<void> => {
        if (profile.avatarUrl) {
          try {
            const optimizedUrl = getOptimizedImageUrl(profile.avatarUrl, "avatar");
            const img = new Image();
            img.crossOrigin = "anonymous";

            await new Promise<void>((resolve, reject) => {
              img.onload = () => resolve();
              img.onerror = () => reject();
              img.src = optimizedUrl;
            });

            ctx.save();
            ctx.beginPath();
            ctx.arc(avatarCenterX, avatarCenterY, avatarRadius, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(img, avatarX, avatarY, avatarSize, avatarSize);
            ctx.restore();

            // Avatar Border
            ctx.beginPath();
            ctx.arc(avatarCenterX, avatarCenterY, avatarRadius, 0, Math.PI * 2);
            ctx.strokeStyle = "#CCCBC8";
            ctx.lineWidth = 2;
            ctx.stroke();
            return;
          } catch {
            // Fallback if avatar fails to load
          }
        }

        // Fallback Initials Avatar
        ctx.beginPath();
        ctx.arc(avatarCenterX, avatarCenterY, avatarRadius, 0, Math.PI * 2);
        ctx.fillStyle = "#F0EEE6";
        ctx.fill();
        ctx.strokeStyle = "#CCCBC8";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = "#141413";
        ctx.font = 'bold 36px "Plus Jakarta Sans", system-ui, sans-serif';
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(profile.name.charAt(0).toUpperCase() || "P", avatarCenterX, avatarCenterY);
        ctx.textAlign = "left";
        ctx.textBaseline = "alphabetic";
      };

      await drawAvatar();

      // 4. Identity Info (Right of Avatar)
      const textX = avatarX + avatarSize + 20;
      let textY = 118;

      // Full Name
      ctx.fillStyle = "#141413";
      ctx.font = 'bold 26px "Plus Jakarta Sans", system-ui, sans-serif';
      ctx.fillText(profile.name, textX, textY);

      // Verified Badge
      if (profile.isVerified) {
        const nameWidth = ctx.measureText(profile.name).width;
        const badgeX = textX + nameWidth + 10;
        const badgeY = textY - 9;

        ctx.beginPath();
        ctx.arc(badgeX + 9, badgeY, 9.5, 0, Math.PI * 2);
        ctx.fillStyle = "#D97757"; // Clay
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(badgeX + 6, badgeY);
        ctx.lineTo(badgeX + 8.5, badgeY + 3.2);
        ctx.lineTo(badgeX + 12.8, badgeY - 2.8);
        ctx.strokeStyle = "#FAF9F5";
        ctx.lineWidth = 1.9;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.stroke();
      }

      // Handle @username
      textY += 24;
      ctx.fillStyle = "#87867F";
      ctx.font = '600 13px "Plus Jakarta Sans", system-ui, sans-serif';
      ctx.fillText(`@${profile.username.toUpperCase()}`, textX, textY);

      // Specialty Pill Badge
      if (profile.specialty && profile.specialty.trim() !== "") {
        textY += 16;
        const specialtyText = profile.specialty.toUpperCase();
        ctx.font = 'bold 10px "Plus Jakarta Sans", system-ui, sans-serif';
        const pillWidth = ctx.measureText(specialtyText).width + 18;

        ctx.fillStyle = "#F0EEE6";
        ctx.beginPath();
        ctx.roundRect(textX, textY, pillWidth, 22, 11);
        ctx.fill();
        ctx.strokeStyle = "#CCCBC8";
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = "#141413";
        ctx.fillText(specialtyText, textX + 9, textY + 15);
      }

      // 5. Bio Section (Wrapped cleanly below identity)
      if (bioLines.length > 0) {
        let currentBioY = avatarY + avatarSize + 26;
        ctx.fillStyle = "#2E2D2B";
        ctx.font = '15px "Newsreader", Georgia, serif';

        for (const line of bioLines) {
          ctx.fillText(line, padding, currentBioY);
          currentBioY += 24;
        }
      }

      // 6. Convert to high-res Blob and Trigger Download
      canvas.toBlob((blob) => {
        if (!blob) {
          toast.error("Failed to generate image.");
          return;
        }
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${profile.username}-portfolio-card.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success("Card image saved successfully.");
      }, "image/png");
    } catch (err) {
      console.error("Save card error:", err);
      toast.error("Unable to save card image.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Share Portfolio"
      size="md"
    >
      <div className="space-y-4 pt-1">
        {/* Clean Profile Card with Top Logo */}
        <ProfileShareCard profile={profile} />

        {/* Profile Link Box with Copy Action */}
        <div className="flex items-center gap-2 p-1.5 bg-ivory-medium/40 border border-stone/70 rounded-xl">
          <span className="font-gothic text-xs font-semibold text-slate-dark px-2.5 truncate flex-1 select-all">
            {displayUrl}
          </span>
          <Button
            type="button"
            variant={copied ? "slate" : "clay"}
            size="sm"
            onClick={handleCopyLink}
            leftIcon={
              copied ? (
                <Check className="w-3.5 h-3.5 text-ivory-light" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )
            }
            className="font-gothic text-xs uppercase tracking-wider shrink-0"
          >
            {copied ? "Copied" : "Copy Link"}
          </Button>
        </div>

        {/* Action Button: Save as Image (For account owner) */}
        {isOwnProfile && (
          <div className="pt-2 flex items-center justify-end border-t border-stone/50">
            <Button
              type="button"
              variant="clay"
              size="sm"
              onClick={handleSaveCardImage}
              isLoading={isDownloading}
              leftIcon={<Download className="w-4 h-4" />}
              className="font-gothic text-xs uppercase tracking-wider"
            >
              Save as Image
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
};
