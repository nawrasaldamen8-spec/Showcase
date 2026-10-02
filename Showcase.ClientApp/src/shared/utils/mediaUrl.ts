export type ImageVariant = "thumb" | "feed" | "detail" | "large" | "avatar" | "blur" | "raw";

const VARIANT_TRANSFORMS: Record<ImageVariant, string> = {
  thumb: "f_auto,q_auto,w_400,c_limit",
  feed: "f_auto,q_auto,w_1000,c_limit",
  detail: "f_auto,q_auto,w_1600,c_limit",
  large: "f_auto,q_auto,w_2400,c_limit",
  avatar: "f_auto,q_auto,w_512,h_512,c_fill,g_face",
  blur: "f_auto,q_auto:eco,w_40,e_blur:1000",
  raw: "f_auto,q_auto",
};

/**
 * Transforms an image URL to a responsive, bandwidth-optimized CDN variant.
 * Injects dynamic Cloudinary transformations for automatic WebP/AVIF format selection,
 * quality compression, dimension constraints (preventing upscaling via c_limit),
 * and responsive delivery.
 */
export function getOptimizedImageUrl(
  src: string | undefined | null,
  variant: ImageVariant = "feed"
): string {
  if (!src || typeof src !== "string") {
    return "";
  }

  const trimmed = src.trim();
  if (!trimmed) {
    return "";
  }

  // Handle Cloudinary dynamic transformation URLs
  if (trimmed.includes("res.cloudinary.com") && trimmed.includes("/image/upload/")) {
    const transform = VARIANT_TRANSFORMS[variant] || VARIANT_TRANSFORMS.feed;
    
    // Check if the URL already has standard f_auto,q_auto transformation prefix
    if (trimmed.includes("/image/upload/f_auto,q_auto/")) {
      return trimmed.replace("/image/upload/f_auto,q_auto/", `/image/upload/${transform}/`);
    }

    // Replace generic /image/upload/ with the variant transformation
    return trimmed.replace("/image/upload/", `/image/upload/${transform}/`);
  }

  // Fallback for non-Cloudinary external images or local assets
  return trimmed;
}
