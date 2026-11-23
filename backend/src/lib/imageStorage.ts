import { v2 as cloudinary } from "cloudinary";

export interface UploadBufferInput {
  buffer: Buffer;
  folder: string;
  filename: string;
}

export interface UploadResult {
  url: string;
  publicId: string;
}

export interface ImageStorage {
  uploadBuffer(input: UploadBufferInput): Promise<UploadResult>;
}

/** Cloudinary v2 image storage adapter using upload_stream (zero disk writes). */
export class CloudinaryImageStorage implements ImageStorage {
  constructor(config: {
    cloudName: string;
    apiKey: string;
    apiSecret: string;
  }) {
    cloudinary.config({
      cloud_name: config.cloudName,
      api_key: config.apiKey,
      api_secret: config.apiSecret,
      secure: true,
    });
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

