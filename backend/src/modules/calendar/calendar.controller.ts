import type { Request, Response } from "express";
import type { CalendarQuery } from "./calendar.schema.js";
import { CalendarService } from "./calendar.service.js";

export class CalendarController {
  constructor(private readonly service: CalendarService) {}

  getCalendar = async (_req: Request, res: Response): Promise<void> => {
    const query = res.locals.query as CalendarQuery;
    const data = await this.service.getMonthlyCalendar(query);
    res.status(200).json({ data });
  };
}

