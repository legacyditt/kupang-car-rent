import { v2 as cloudinary } from "cloudinary";
import { AppError } from "../utils/AppError.js";

export const ALLOWED_IMAGE_FORMATS = ["jpg", "jpeg", "png", "webp"] as const;

export interface UploadBufferInput {
  buffer: Buffer;
  folder: string;
  filename: string;
}

export interface UploadResult {
  url: string;
  publicId: string;
}

export interface UploadSignatureResult {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
  allowedFormats: string;
}

export interface ImageStorage {
  uploadBuffer(input: UploadBufferInput): Promise<UploadResult>;
  createUploadSignature(folder: string): UploadSignatureResult;
}

/** Cloudinary v2 image storage adapter using upload_stream and signed direct-upload parameters. */
export class CloudinaryImageStorage implements ImageStorage {
  private readonly cloudName: string;
  private readonly apiKey: string;
  private readonly apiSecret: string;

  constructor(config: {
    cloudName: string;
    apiKey: string;
    apiSecret: string;
  }) {
    this.cloudName = config.cloudName.trim();
    this.apiKey = config.apiKey.trim();
    this.apiSecret = config.apiSecret.trim();

    cloudinary.config({
      cloud_name: this.cloudName,
      api_key: this.apiKey,
      api_secret: this.apiSecret,
      secure: true,
    });
  }

  /**
   * Generates a short-lived Cloudinary signature so the browser can upload
   * directly to Cloudinary without routing up to 5 MB payloads through Vercel Serverless.
   */
  createUploadSignature(folder: string): UploadSignatureResult {
    if (!this.cloudName || !this.apiKey || !this.apiSecret) {
      throw new AppError(
        503,
        "STORAGE_NOT_CONFIGURED",
        "Konfigurasi Cloudinary belum lengkap di server."
      );
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const allowedFormats = ALLOWED_IMAGE_FORMATS.join(",");
    const paramsToSign = {
      allowed_formats: allowedFormats,
      folder,
      timestamp,
    };

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      this.apiSecret
    );

    return {
      signature,
      timestamp,
      apiKey: this.apiKey,
      cloudName: this.cloudName,
      folder,
      allowedFormats,
    };
  }

  async uploadBuffer({
    buffer,
    folder,
    filename,
  }: UploadBufferInput): Promise<UploadResult> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          public_id: `${Date.now()}-${filename.replace(/\.[^.]+$/, "")}`,
          resource_type: "image",
          transformation: [{ quality: "auto", fetch_format: "auto" }],
        },
        (err, result) => {
          if (err || !result) {
            reject(
              new Error(err?.message ?? "Gagal mengunggah gambar ke Cloudinary.")
            );
            return;
          }
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        }
      );
      stream.end(buffer);
    });
  }
}

