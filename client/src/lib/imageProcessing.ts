/**
 * Resize and compress an image for profile upload. Keeps aspect ratio.
 * Target max dimension 1536px, JPEG quality ~0.85. Returns a new File suitable for upload.
 */
const MAX_DIMENSION = 1536;
const JPEG_QUALITY = 0.85;

export async function prepareProfileImage(file: File): Promise<File> {
  const type = (file.type || "").toLowerCase();
  const isImage =
    type.startsWith("image/") ||
    /\.(jpe?g|png|webp|gif|bmp)$/i.test(file.name);
  if (!isImage) {
    return file;
  }

  return new Promise((resolve, reject) => {
    const img = document.createElement("img");
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      if (w <= 0 || h <= 0) {
        resolve(file);
        return;
      }
      let targetW = w;
      let targetH = h;
      if (w > MAX_DIMENSION || h > MAX_DIMENSION) {
        if (w >= h) {
          targetW = MAX_DIMENSION;
          targetH = Math.round((h * MAX_DIMENSION) / w);
        } else {
          targetH = MAX_DIMENSION;
          targetW = Math.round((w * MAX_DIMENSION) / h);
        }
      }
      const canvas = document.createElement("canvas");
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(file);
        return;
      }
      ctx.drawImage(img, 0, 0, targetW, targetH);
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          const out = new File([blob], "profile.jpg", {
            type: "image/jpeg",
            lastModified: Date.now(),
          });
          resolve(out);
        },
        "image/jpeg",
        JPEG_QUALITY
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };

    img.src = url;
  });
}
