import type { Request, Response } from "express";
import multer from "multer";
import type { CreateUploadSignatureInput } from "./upload.schema.js";
import {
  MAX_CAR_IMAGE_BYTES,
  MAX_LOGO_BYTES,
  UploadService,
} from "./upload.service.js";

export { MAX_CAR_IMAGE_BYTES, MAX_LOGO_BYTES };

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

  createSignature = (req: Request, res: Response): void => {
    const data = this.service.createSignature(
      req.body as CreateUploadSignatureInput
    );
    res.status(200).json({ data });
  };

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

