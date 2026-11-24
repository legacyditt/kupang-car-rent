import type { Request, Response } from "express";
import type { UpdateBusinessProfileInput } from "./businessProfile.schema.js";
import { BusinessProfileService } from "./businessProfile.service.js";

export class BusinessProfileController {
  constructor(private readonly service: BusinessProfileService) {}

  getPublicProfile = async (_req: Request, res: Response): Promise<void> => {
    const data = await this.service.getProfile();
    res.status(200).json({ data });
  };

  updateProfile = async (req: Request, res: Response): Promise<void> => {
    const input = req.body as UpdateBusinessProfileInput;
    const data = await this.service.updateProfile(input);
    res.status(200).json({ data });
  };

  resetLogo = async (_req: Request, res: Response): Promise<void> => {
    const data = await this.service.resetLogo();
    res.status(200).json({ data });
  };
}

