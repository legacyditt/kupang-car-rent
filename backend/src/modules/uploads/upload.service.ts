import type {
  ImageStorage,
  UploadResult,
  UploadSignatureResult,
} from "../../lib/imageStorage.js";
import { AppError } from "../../utils/AppError.js";
import type { CreateUploadSignatureInput } from "./upload.schema.js";

export const MAX_CAR_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB
export const MAX_LOGO_BYTES = 1_048_576; // 1 MB

const UPLOAD_TARGET_POLICIES: Record<
  CreateUploadSignatureInput["target"],
  { folder: string; maxBytes: number }
> = {
  "car-image": { folder: "aventra-rental/cars", maxBytes: MAX_CAR_IMAGE_BYTES },
  logo: { folder: "aventra-rental/brand", maxBytes: MAX_LOGO_BYTES },
};

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

function hasValidImageMagicBytes(buffer: Buffer): boolean {
  if (buffer.length < 12) return false;
  // JPEG: FF D8 FF
  const isJpeg =
    buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  const isPng =
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47;
  // WEBP: RIFF....WEBP
  const isWebp =
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP";

  return isJpeg || isPng || isWebp;
}

export class UploadService {
  constructor(private readonly storage: ImageStorage) {}

  /** Validates file metadata against target limits and issues a signed direct-upload payload. */
  createSignature(input: CreateUploadSignatureInput): UploadSignatureResult {
    const policy = UPLOAD_TARGET_POLICIES[input.target];
    if (input.fileSize > policy.maxBytes) {
      throw new AppError(
        400,
        "FILE_TOO_LARGE",
        "Ukuran file melebihi batas maksimum yang diizinkan."
      );
    }
    return this.storage.createUploadSignature(policy.folder);
  }

  async uploadImage(params: {
    file: Express.Multer.File | undefined;
    folder: string;
    maxBytes: number;
  }): Promise<UploadResult> {
    const { file, folder, maxBytes } = params;
    if (!file) {
      throw new AppError(400, "INVALID_FILE", "File gambar wajib diunggah.");
    }

    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      throw new AppError(
        400,
        "INVALID_FILE",
        "Format gambar harus JPG, PNG, atau WEBP."
      );
    }

    if (file.size > maxBytes) {
      throw new AppError(
        400,
        "FILE_TOO_LARGE",
        "Ukuran file melebihi batas maksimum yang diizinkan."
      );
    }

    if (!hasValidImageMagicBytes(file.buffer)) {
      throw new AppError(
        400,
        "INVALID_FILE",
        "Konten file bukan gambar JPG, PNG, atau WEBP yang valid."
      );
    }

    return this.storage.uploadBuffer({
      buffer: file.buffer,
      folder,
      filename: file.originalname || "image.png",
    });
  }
}

