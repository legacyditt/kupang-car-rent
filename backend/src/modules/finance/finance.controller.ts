import type { Request, Response } from "express";
import type { FinanceQuery } from "./finance.schema.js";
import { FinanceService } from "./finance.service.js";

export class FinanceController {
  constructor(private readonly service: FinanceService) {}

  getSummary = async (_req: Request, res: Response): Promise<void> => {
    const query = res.locals.query as FinanceQuery;
    const data = await this.service.getSummary(query.month);
    res.status(200).json({ data });
  };
}

