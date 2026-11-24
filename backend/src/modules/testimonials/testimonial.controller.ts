import type { Request, Response } from "express";
import type {
  AdminUpsertTestimonialInput,
  EligibilityQuery,
  SubmitPublicTestimonialInput,
  UpdateTestimonialStatusInput,
} from "./testimonial.schema.js";
import { TestimonialService } from "./testimonial.service.js";

export class TestimonialController {
  constructor(private readonly service: TestimonialService) {}

  listPublic = async (_req: Request, res: Response): Promise<void> => {
    const data = await this.service.listPublished();
    res.status(200).json({ data });
  };

  checkEligibility = async (_req: Request, res: Response): Promise<void> => {
    const query = res.locals.query as EligibilityQuery;
    const data = await this.service.checkEligibility(query.kode);
    res.status(200).json({ data });
  };

  submitPublic = async (req: Request, res: Response): Promise<void> => {
    const input = req.body as SubmitPublicTestimonialInput;
    const data = await this.service.submitPublic(input);
    res.status(201).json({ data });
  };

  listAdmin = async (_req: Request, res: Response): Promise<void> => {
    const data = await this.service.listAllAdmin();
    res.status(200).json({ data });
  };

  createAdmin = async (req: Request, res: Response): Promise<void> => {
    const input = req.body as AdminUpsertTestimonialInput;
    const data = await this.service.createAdmin(input);
    res.status(201).json({ data });
  };

  updateAdmin = async (req: Request, res: Response): Promise<void> => {
    const id = String(req.params.id ?? "");
    const input = req.body as Partial<AdminUpsertTestimonialInput>;
    const data = await this.service.updateAdmin(id, input);
    res.status(200).json({ data });
  };

  updateStatus = async (req: Request, res: Response): Promise<void> => {
    const id = String(req.params.id ?? "");
    const { status } = req.body as UpdateTestimonialStatusInput;
    const data = await this.service.setStatus(id, status);
    res.status(200).json({ data });
  };

  deleteAdmin = async (req: Request, res: Response): Promise<void> => {
    const id = String(req.params.id ?? "");
    await this.service.deleteAdmin(id);
    res.status(200).json({ data: { deleted: true } });
  };
}

