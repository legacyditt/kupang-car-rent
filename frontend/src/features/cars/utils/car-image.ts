export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const MAX_IMAGE_FILE_BYTES = 5 * 1024 * 1024;
export const MIN_IMAGE_WIDTH = 640;
export const MIN_IMAGE_HEIGHT = 400;

export const TARGET_CANVAS_WIDTH = 1600;
export const TARGET_CANVAS_HEIGHT = 1000;
export const MAX_WIDTH_RATIO = 0.88;
export const MAX_HEIGHT_RATIO = 0.78;

export type ValidationResult = { ok: true } | { ok: false; error: string };

export interface NormalizedCarImage {
  dataUrl: string;
  originalWidth: number;
  originalHeight: number;
  outputWidth: number;
  outputHeight: number;
}

export function validateCarImageFile(file: {
  type: string;
  size: number;
}): ValidationResult {
  if (
    !ALLOWED_IMAGE_TYPES.includes(
      file.type as (typeof ALLOWED_IMAGE_TYPES)[number]
    )
  ) {
    return {
      ok: false,
      error: "Format foto harus JPG, PNG, atau WEBP.",
    };
  }

  if (file.size > MAX_IMAGE_FILE_BYTES) {
    return {
      ok: false,
      error: "Ukuran file foto maksimal 5 MB.",
    };
  }

  return { ok: true };
}

export function validateCarImageDimensions(
  width: number,
  height: number
): ValidationResult {
  if (width < MIN_IMAGE_WIDTH || height < MIN_IMAGE_HEIGHT) {
    return {
      ok: false,
      error: `Resolusi foto terlalu kecil (${width}×${height}). Minimal ${MIN_IMAGE_WIDTH}×${MIN_IMAGE_HEIGHT} px.`,
    };
  }
  return { ok: true };
}

export function computeNormalizedPlacement(
  srcWidth: number,
  srcHeight: number
): { width: number; height: number; x: number; y: number } {
  const maxWidth = Math.round(TARGET_CANVAS_WIDTH * MAX_WIDTH_RATIO);
  const maxHeight = Math.round(TARGET_CANVAS_HEIGHT * MAX_HEIGHT_RATIO);
  const scale = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);

  const width = Math.max(1, Math.round(srcWidth * scale));
  const height = Math.max(1, Math.round(srcHeight * scale));
  const x = Math.floor((TARGET_CANVAS_WIDTH - width) / 2);
  const y = Math.floor((TARGET_CANVAS_HEIGHT - height) / 2);

  return { width, height, x, y };
}

export async function normalizeCarImageFile(
  file: File
): Promise<NormalizedCarImage> {
  const fileCheck = validateCarImageFile(file);
  if (!fileCheck.ok) {
    throw new Error(fileCheck.error);
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("Gagal membaca file foto."));
      el.src = objectUrl;
    });

    const dimCheck = validateCarImageDimensions(
      img.naturalWidth,
      img.naturalHeight
    );
    if (!dimCheck.ok) {
      throw new Error(dimCheck.error);
    }

    const canvas = document.createElement("canvas");
    canvas.width = TARGET_CANVAS_WIDTH;
    canvas.height = TARGET_CANVAS_HEIGHT;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Browser tidak mendukung pemrosesan kanvas foto.");
    }

    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, TARGET_CANVAS_WIDTH, TARGET_CANVAS_HEIGHT);

    const { width, height, x, y } = computeNormalizedPlacement(
      img.naturalWidth,
      img.naturalHeight
    );
    ctx.drawImage(img, x, y, width, height);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.88);
    return {
      dataUrl,
      originalWidth: img.naturalWidth,
      originalHeight: img.naturalHeight,
      outputWidth: TARGET_CANVAS_WIDTH,
      outputHeight: TARGET_CANVAS_HEIGHT,
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
