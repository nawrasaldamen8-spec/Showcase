export interface ImageValidationOptions {
  maxSizeBytes?: number;
  allowedTypes?: string[];
}

export interface ImageValidationResult {
  isValid: boolean;
  error?: string;
}

export const DEFAULT_MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB default
export const DEFAULT_ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

/**
 * Validates file format and size constraints for media uploads.
 */
export function validateImageFile(
  file: File,
  options: ImageValidationOptions = {}
): ImageValidationResult {
  const maxSizeBytes = options.maxSizeBytes ?? DEFAULT_MAX_IMAGE_SIZE_BYTES;
  const allowedTypes = options.allowedTypes ?? DEFAULT_ALLOWED_IMAGE_TYPES;

  const fileTypeLower = file.type.toLowerCase();
  const isTypeAllowed =
    allowedTypes.includes(fileTypeLower) ||
    /\.(jpe?g|png|webp|gif)$/i.test(file.name);

  if (!isTypeAllowed) {
    return {
      isValid: false,
      error: `"${file.name}" is not a supported format. Please upload JPEG, PNG, WebP, or GIF images.`,
    };
  }

  if (file.size > maxSizeBytes) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    const maxMb = (maxSizeBytes / (1024 * 1024)).toFixed(0);
    return {
      isValid: false,
      error: `"${file.name}" exceeds the ${maxMb}MB size limit (${sizeMb}MB).`,
    };
  }

  return { isValid: true };
}

/**
 * Uploads a file directly to storage (Cloudflare R2 presigned PUT URL or Cloudinary POST).
 */
export async function uploadDirectToStorage(
  uploadUrl: string,
  file: File | Blob,
  onProgress?: (percent: number) => void
): Promise<string> {
  onProgress?.(10);

  // Handle Cloudinary Upload
  if (uploadUrl.includes("api.cloudinary.com")) {
    const urlObj = new URL(uploadUrl);
    const params = new URLSearchParams(urlObj.search);

    const formData = new FormData();
    formData.append("file", file);
    params.forEach((value, key) => {
      formData.append(key, value);
    });

    onProgress?.(40);
    const response = await fetch(urlObj.origin + urlObj.pathname, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMsg = errorData?.error?.message || response.statusText;
      throw new Error(`Failed to upload to Cloudinary: ${errorMsg}`);
    }

    onProgress?.(90);
    const result = await response.json().catch(() => null);
    onProgress?.(100);
    return result?.secure_url || uploadUrl;
  }

  // Handle Direct S3/R2 Presigned PUT Upload
  onProgress?.(30);
  const response = await fetch(uploadUrl, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": file.type || "application/octet-stream",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to upload image directly to storage: ${response.statusText}`
    );
  }

  onProgress?.(100);
  return uploadUrl;
}

export const mediaUploadService = {
  validateImageFile,
  uploadDirectToStorage,
};
