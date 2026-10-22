import React, { useState } from "react";
import { Check, Copy, Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@shared/components/Button.tsx";
import { Modal } from "@shared/components/Modal.tsx";
import type { PostDetailsResponse } from "@shared/types/index.ts";
import { getOptimizedImageUrl } from "@shared/utils/mediaUrl.ts";
import { PostShareCard } from "./PostShareCard.tsx";

export interface SharePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: PostDetailsResponse;
  creatorName: string;
  creatorUsername: string;
  creatorAvatar?: string;
  isOwnPost?: boolean;
}

export const SharePostModal: React.FC<SharePostModalProps> = ({
  isOpen,
  onClose,
  post,
  creatorName,
  creatorUsername,
  creatorAvatar,
}) => {
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const fullShareUrl = `https://pority.me/posts/${post.id}`;

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
      toast.success("Project link copied to clipboard.");
      setTimeout(() => setCopied(false), 2200);
    } catch {
      toast.error("Unable to copy project link.");
    }
  };

  const handleSaveCardImage = async () => {
    setIsDownloading(true);
    try {
      if (document.fonts?.ready) {
        try {
          await document.fonts.ready;
        } catch {
          // font readiness error ignored
        }
      }

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas context unavailable");

      const width = 760;
      const padding = 44;
      const coverW = width - padding * 2;
      const coverH = Math.round(coverW * (10 / 16));

      // Wrap post title text to calculate height
      ctx.font = 'bold 24px "Plus Jakarta Sans", sans-serif';
      const titleWords = post.title.trim().split(" ");
      const titleLines: string[] = [];
      let currentLine = "";

      for (let i = 0; i < titleWords.length; i++) {
        const word = titleWords[i] ?? "";
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const metrics = ctx.measureText(testLine);
        if (metrics.width > coverW && i > 0) {
          titleLines.push(currentLine);
          currentLine = word;
          if (titleLines.length >= 2) {
            currentLine += "...";
            break;
          }
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine && titleLines.length < 2) {
        titleLines.push(currentLine);
      }

      const titleHeight = Math.max(titleLines.length, 1) * 32;
      const height = 36 + 28 + 20 + coverH + 24 + titleHeight + 24 + 54 + 36;

      const scale = 3;
      canvas.width = width * scale;
      canvas.height = height * scale;
      ctx.scale(scale, scale);

      // 1. Background Card
      ctx.fillStyle = "#faf8f5";
      ctx.beginPath();
      ctx.roundRect(0, 0, width, height, 24);
      ctx.fill();

      // Card Border
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = "#CCCBC8";
      ctx.stroke();

      // 2. Draw Pority Logo Symbol Alone at Top-Left
      ctx.save();
      ctx.translate(padding, 36);
      ctx.scale(0.28, 0.28);
      ctx.fillStyle = "#141413";

      ctx.beginPath();
      ctx.roundRect(5, 44, 28, 72, 0.5);
      ctx.fill();

      const archPath = new Path2D("M 35 4 H 95 V 76 H 68 V 36 C 68 20, 35 20, 35 36 Z");
      ctx.fill(archPath);

      ctx.beginPath();
      ctx.roundRect(51, 78, 17, 38, 0.5);
      ctx.fill();
      ctx.restore();

      // 3. Cover Image
      const coverX = padding;
      const coverY = 36 + 28 + 20;
      const primaryImage = post.images?.[0];

      let coverLoaded = false;
      if (primaryImage?.url) {
        try {
          const optimizedCoverUrl = getOptimizedImageUrl(primaryImage.url, "detail") || primaryImage.url;
          const coverImg = new Image();
          coverImg.crossOrigin = "anonymous";
          await new Promise<void>((resolve, reject) => {
            coverImg.onload = () => resolve();
            coverImg.onerror = () => reject();
            coverImg.src = optimizedCoverUrl;
          });

          ctx.save();
          ctx.beginPath();
          ctx.roundRect(coverX, coverY, coverW, coverH, 14);
          ctx.clip();

          const imgRatio = coverImg.width / coverImg.height;
          const targetRatio = coverW / coverH;
          let sWidth = coverImg.width;
          let sHeight = coverImg.height;
          let sx = 0;
          let sy = 0;
          if (imgRatio > targetRatio) {
            sWidth = coverImg.height * targetRatio;
            sx = (coverImg.width - sWidth) / 2;
          } else {
            sHeight = coverImg.width / targetRatio;
            sy = (coverImg.height - sHeight) / 2;
          }
          ctx.drawImage(coverImg, sx, sy, sWidth, sHeight, coverX, coverY, coverW, coverH);
          ctx.restore();

          coverLoaded = true;
        } catch {
          coverLoaded = false;
        }
      }

      if (!coverLoaded) {
        ctx.fillStyle = "#e6e3da";
        ctx.beginPath();
        ctx.roundRect(coverX, coverY, coverW, coverH, 14);
        ctx.fill();
      }

      // Border around cover
      ctx.beginPath();
      ctx.roundRect(coverX, coverY, coverW, coverH, 14);
      ctx.strokeStyle = "#CCCBC8";
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // 4. Project Title
      const titleStartY = coverY + coverH + 30;
      ctx.fillStyle = "#141413";
      ctx.font = 'bold 24px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";

      titleLines.forEach((line, index) => {
        ctx.fillText(line, padding, titleStartY + index * 32);
      });

      // 5. Divider Line
      const dividerY = titleStartY + titleHeight + 12;
      ctx.beginPath();
      ctx.moveTo(padding, dividerY);
      ctx.lineTo(width - padding, dividerY);
      ctx.strokeStyle = "#e2dfd7";
      ctx.lineWidth = 1;
      ctx.stroke();

      // 6. Creator Identity Footer
      const footerY = dividerY + 18;
      const avatarSize = 44;
      const avatarRadius = avatarSize / 2;
      const avatarCenterX = padding + avatarRadius;
      const avatarCenterY = footerY + avatarRadius;

      let avatarLoaded = false;
      if (creatorAvatar) {
        try {
          const optimizedAvatarUrl = getOptimizedImageUrl(creatorAvatar, "avatar") || creatorAvatar;
          const avatarImg = new Image();
          avatarImg.crossOrigin = "anonymous";
          await new Promise<void>((resolve, reject) => {
            avatarImg.onload = () => resolve();
            avatarImg.onerror = () => reject();
            avatarImg.src = optimizedAvatarUrl;
          });

          ctx.save();
          ctx.beginPath();
          ctx.arc(avatarCenterX, avatarCenterY, avatarRadius, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(avatarImg, padding, footerY, avatarSize, avatarSize);
          ctx.restore();

          avatarLoaded = true;
        } catch {
          avatarLoaded = false;
        }
      }

      if (!avatarLoaded) {
        ctx.beginPath();
        ctx.arc(avatarCenterX, avatarCenterY, avatarRadius, 0, Math.PI * 2);
        ctx.fillStyle = "#e6e3da";
        ctx.fill();

        ctx.fillStyle = "#141413";
        ctx.font = 'bold 16px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const initial = creatorName.charAt(0).toUpperCase() || "U";
        ctx.fillText(initial, avatarCenterX, avatarCenterY);
      }

      // Avatar Border
      ctx.beginPath();
      ctx.arc(avatarCenterX, avatarCenterY, avatarRadius, 0, Math.PI * 2);
      ctx.strokeStyle = "#CCCBC8";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Creator Name & Handle
      const textX = padding + avatarSize + 14;
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";

      ctx.fillStyle = "#141413";
      ctx.font = 'bold 16px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(creatorName, textX, footerY + 20);

      // Verified Badge if verified
      if (post.creator?.isVerified) {
        const nameWidth = ctx.measureText(creatorName).width;
        const badgeX = textX + nameWidth + 8;
        const badgeY = footerY + 14;
        ctx.beginPath();
        ctx.arc(badgeX + 6, badgeY, 7, 0, Math.PI * 2);
        ctx.fillStyle = "#b87d4b";
        ctx.fill();

        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(badgeX + 3.5, badgeY);
        ctx.lineTo(badgeX + 5.5, badgeY + 2.5);
        ctx.lineTo(badgeX + 9, badgeY - 2);
        ctx.stroke();
      }

      ctx.fillStyle = "#686661";
      ctx.font = '13px "Newsreader", Georgia, serif';
      ctx.fillText(`@${creatorUsername}`, textX, footerY + 38);

      // Download generated image
      canvas.toBlob((blob) => {
        if (!blob) throw new Error("Canvas export failed");
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        const cleanSlug = post.title
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");
        link.href = url;
        link.download = `${cleanSlug || "project"}-card.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success("Project card saved successfully.");
      }, "image/png");
    } catch (err) {
      console.error("Save card error:", err);
      toast.error("Unable to save project card.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Share Project"
      size="md"
    >
      <div className="space-y-3.5 pt-0.5">
        {/* Aesthetic Project Card */}
        <PostShareCard
          post={post}
          creatorName={creatorName}
          creatorUsername={creatorUsername}
          creatorAvatar={creatorAvatar}
        />

        {/* Action Buttons: Copy Link & Save as Image */}
        <div className="pt-2.5 flex items-center justify-end gap-2.5 border-t border-stone/50">
          <Button
            type="button"
            variant={copied ? "slate" : "outline"}
            size="sm"
            onClick={handleCopyLink}
            leftIcon={
              copied ? (
                <Check className="w-3.5 h-3.5 text-ivory-light" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )
            }
            className="font-gothic text-xs uppercase tracking-wider"
          >
            {copied ? "Copied" : "Copy Link"}
          </Button>

          <Button
            type="button"
            variant="clay"
            size="sm"
            onClick={handleSaveCardImage}
            isLoading={isDownloading}
            leftIcon={<Download className="w-3.5 h-3.5 text-ivory-light" />}
            className="font-gothic text-xs uppercase tracking-wider"
          >
            Save as Image
          </Button>
        </div>
      </div>
    </Modal>
  );
};
