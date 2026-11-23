import type { Request, Response } from "express";
import { DashboardService } from "./dashboard.service.js";

export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  getSummary = async (_req: Request, res: Response): Promise<void> => {
    const data = await this.service.getSummary();
    res.status(200).json({ data });
  };
}

