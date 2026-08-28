export const productBucket = "product-images";
export const avatarBucket = "avatars";

// Kept in step with the buckets' own limits, so the browser can reject a bad
// file before spending an upload on it.
export const maxImageBytes = 5 * 1024 * 1024;
export const acceptedImageTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
export const acceptAttribute = acceptedImageTypes.join(",");

export function imageProblem(file: File) {
  if (!acceptedImageTypes.includes(file.type)) return "Use a JPEG, PNG, WebP or AVIF image.";
  if (file.size > maxImageBytes) return "Keep the image under 5 MB.";
  return null;
}

export function storedPath(bucket: string, imageUrl: string) {
  const marker = `/${bucket}/`;
  const at = imageUrl.indexOf(marker);
  return at === -1 ? "" : imageUrl.slice(at + marker.length);
}
