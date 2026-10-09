import React, { useCallback, useEffect, useRef, useState } from "react";
import { Modal } from "@shared/components/feedback/Modal.tsx";
import { Button } from "@shared/components/Button.tsx";
import { ZoomIn, ZoomOut, RotateCcw, Check } from "lucide-react";

export interface AvatarCropModalProps {
  isOpen: boolean;
  imageSrc: string | null;
  onClose: () => void;
  onConfirm: (croppedBlob: Blob) => Promise<void>;
  isUploading?: boolean;
}

export const AvatarCropModal: React.FC<AvatarCropModalProps> = ({
  isOpen,
  imageSrc,
  onClose,
  onConfirm,
  isUploading = false,
}) => {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Reset controls when a new image is loaded
  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen, imageSrc]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isUploading) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isUploading || !e.touches[0]) return;
    setIsDragging(true);
    setDragStart({
      x: e.touches[0].clientX - position.x,
      y: e.touches[0].clientY - position.y,
    });
  };

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging || !e.touches[0]) return;
    setPosition({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    });
  }, [isDragging, dragStart]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleTouchMove, { passive: false });
      window.addEventListener("touchend", handleTouchEnd);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  const handleReset = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleSaveCroppedImage = async () => {
    if (!imageRef.current || !containerRef.current) return;

    const img = imageRef.current;
    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();

    // Export Canvas with 512x512 dimensions for crisp avatar resolution
    const exportSize = 512;
    const canvas = document.createElement("canvas");
    canvas.width = exportSize;
    canvas.height = exportSize;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // Fill neutral background in case of transparent PNG
    ctx.fillStyle = "#1e1d1b";
    ctx.fillRect(0, 0, exportSize, exportSize);

    // Calculate transformations
    const scaleFactor = exportSize / containerRect.width;

    ctx.save();
    ctx.translate(exportSize / 2, exportSize / 2);
    ctx.scale(zoom, zoom);

    // Calculate drawn image dimensions relative to container center
    const imgNaturalRatio = img.naturalWidth / img.naturalHeight;
    let drawWidth = exportSize;
    let drawHeight = exportSize;

    if (imgNaturalRatio > 1) {
      drawWidth = exportSize * imgNaturalRatio;
      drawHeight = exportSize;
    } else {
      drawWidth = exportSize;
      drawHeight = exportSize / imgNaturalRatio;
    }

    const drawX = -drawWidth / 2 + position.x * scaleFactor;
    const drawY = -drawHeight / 2 + position.y * scaleFactor;

    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
    ctx.restore();

    canvas.toBlob(
      async (blob) => {
        if (blob) {
          await onConfirm(blob);
        }
      },
      "image/jpeg",
      0.92
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={isUploading ? () => {} : onClose}
      title="Adjust Profile Photo"
      size="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onClose}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="clay"
            size="md"
            onClick={handleSaveCroppedImage}
            isLoading={isUploading}
            leftIcon={<Check className="h-4 w-4" />}
          >
            Save Photo
          </Button>
        </div>
      }
    >
      <div className="flex flex-col items-center justify-center space-y-4">
        {/* Main Crop Workspace */}
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          className="relative w-full max-w-[280px] aspect-square rounded-2xl overflow-hidden bg-slate-dark/95 border-2 border-stone select-none cursor-grab active:cursor-grabbing flex items-center justify-center touch-none"
        >
          {imageSrc && (
            <img
              ref={imageRef}
              src={imageSrc}
              alt="Crop preview"
              draggable={false}
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                transition: isDragging ? "none" : "transform 0.1s ease-out",
                maxWidth: "none",
                maxHeight: "none",
              }}
              className="pointer-events-none object-contain h-full w-full"
            />
          )}

          {/* Circular Overlay Mask Guide */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              boxShadow: "0 0 0 9999px rgba(26, 25, 24, 0.65)",
              borderRadius: "50%",
              margin: "10px",
              border: "2px solid rgba(226, 125, 96, 0.85)",
            }}
          />

          {/* Subtle Center Crosshair */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-8 h-[1px] bg-clay/50" />
            <div className="h-8 w-[1px] bg-clay/50 absolute" />
          </div>
        </div>

        {/* Zoom and Reset Controls Bar */}
        <div className="w-full max-w-[280px] bg-stone/25 rounded-xl p-3 border border-stone/50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-gothic text-[11px] font-bold uppercase tracking-wider text-slate-dark">
              Zoom Scale
            </span>
            <span className="font-gothic text-[11px] font-bold text-clay">
              {Math.round(zoom * 100)}%
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(0.5, Number((z - 0.1).toFixed(2))))}
              disabled={isUploading || zoom <= 0.5}
              className="p-1.5 text-cloud-dark hover:text-slate-dark hover:bg-stone/50 rounded-lg transition-colors disabled:opacity-40"
              aria-label="Zoom out"
            >
              <ZoomOut className="h-4 w-4" />
            </button>

            <input
              type="range"
              min={0.5}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              disabled={isUploading}
              aria-label="Zoom photo"
              className="flex-1 accent-clay h-1.5 bg-stone rounded-lg cursor-pointer"
            />

            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(3, Number((z + 0.1).toFixed(2))))}
              disabled={isUploading || zoom >= 3}
              className="p-1.5 text-cloud-dark hover:text-slate-dark hover:bg-stone/50 rounded-lg transition-colors disabled:opacity-40"
              aria-label="Zoom in"
            >
              <ZoomIn className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={handleReset}
              disabled={isUploading}
              className="p-1.5 text-cloud-dark hover:text-slate-dark hover:bg-stone/50 rounded-lg transition-colors disabled:opacity-40 ml-1"
              title="Reset position and zoom"
              aria-label="Reset position and zoom"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
