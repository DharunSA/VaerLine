/**
 * Cloudinary Image Upload Utility
 * Uses unsigned upload preset — no API secret exposed on client.
 *
 * Required env vars:
 *   VITE_CLOUDINARY_CLOUD_NAME  — e.g. "my-family-tree"
 *   VITE_CLOUDINARY_UPLOAD_PRESET — unsigned preset name, e.g. "vaerline_unsigned"
 *
 * How to set up (free Cloudinary account):
 * 1. Sign up at https://cloudinary.com
 * 2. Go to Settings > Upload > Upload presets > Add preset
 * 3. Set Signing Mode = "Unsigned", note the preset name
 * 4. Add both vars to .env.local
 */

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string | undefined;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string | undefined;

export interface CloudinaryUploadResult {
  secureUrl: string;
  publicId: string;
  width: number;
  height: number;
}

/**
 * Upload a File object to Cloudinary and return the secure CDN URL.
 * Throws an error if Cloudinary is not configured or the upload fails.
 */
export async function uploadToCloudinary(file: File): Promise<CloudinaryUploadResult> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error(
      'Cloudinary is not configured. Add VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET to your .env.local file.'
    );
  }

  const endpoint = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', 'vaerline/members');

  const response = await fetch(endpoint, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData?.error?.message ?? `Cloudinary upload failed with status ${response.status}`
    );
  }

  const data = await response.json();

  return {
    secureUrl: data.secure_url as string,
    publicId: data.public_id as string,
    width: data.width as number,
    height: data.height as number,
  };
}

/** Returns true if Cloudinary credentials are present in env */
export function isCloudinaryConfigured(): boolean {
  return Boolean(CLOUD_NAME && UPLOAD_PRESET);
}
