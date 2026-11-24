import type { Request, Response } from "express";
import multer from "multer";
import { UploadService } from "./upload.service.js";

export const MAX_CAR_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB
export const MAX_LOGO_BYTES = 1_048_576; // 1 MB

export const carImageUploadMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_CAR_IMAGE_BYTES },
}).single("file");

export const logoUploadMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_LOGO_BYTES },
}).single("file");

export class UploadController {
  constructor(private readonly service: UploadService) {}

  uploadCarImage = async (req: Request, res: Response): Promise<void> => {
    const data = await this.service.uploadImage({
      file: req.file,
      folder: "aventra-rental/cars",
      maxBytes: MAX_CAR_IMAGE_BYTES,
    });
    res.status(201).json({ data });
  };

  uploadLogo = async (req: Request, res: Response): Promise<void> => {
    const data = await this.service.uploadImage({
      file: req.file,
      folder: "aventra-rental/brand",
      maxBytes: MAX_LOGO_BYTES,
    });
    res.status(201).json({ data });
  };
}

