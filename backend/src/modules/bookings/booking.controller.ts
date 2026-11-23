import type { Request, Response } from "express";
import type {
  AdminCreateBookingInput,
  CreatePublicBookingInput,
  ExtendBookingInput,
  ListBookingsQuery,
  UpdateBookingDetailsInput,
  UpdateBookingPaymentInput,
  UpdateBookingStatusInput,
} from "./booking.schema.js";
import { BookingService } from "./booking.service.js";

export class BookingController {
  constructor(private readonly service: BookingService) {}

  createPublicBooking = async (req: Request, res: Response): Promise<void> => {
    const idempotencyKey = req.header("Idempotency-Key");
    const input = req.body as CreatePublicBookingInput;
    const { booking, deduplicated } = await this.service.createBooking(input, {
      idempotencyKey,
      isAdmin: false,
    });
    res.status(deduplicated ? 200 : 201).json({ data: booking });
  };

  getPublicByCode = async (req: Request, res: Response): Promise<void> => {
    const bookingCode = String(req.params.bookingCode ?? "");
    const data = await this.service.getPublicByBookingCode(bookingCode);
    res.status(200).json({ data });
  };

  listAdminBookings = async (_req: Request, res: Response): Promise<void> => {
    const query = res.locals.query as ListBookingsQuery;
    const data = await this.service.listAdminBookings(query);
    res.status(200).json({ data });
  };

  getAdminBooking = async (req: Request, res: Response): Promise<void> => {
    const id = String(req.params.id ?? "");
    const data = await this.service.getAdminBookingById(id);
    res.status(200).json({ data });
  };

  createAdminBooking = async (req: Request, res: Response): Promise<void> => {
    const input = req.body as AdminCreateBookingInput;
    const { booking } = await this.service.createBooking(input, {
      isAdmin: true,
    });
    res.status(201).json({ data: booking });
  };

  updateBookingDetails = async (req: Request, res: Response): Promise<void> => {
    const id = String(req.params.id ?? "");
    const patch = req.body as UpdateBookingDetailsInput;
    const data = await this.service.updateBookingDetails(id, patch);
    res.status(200).json({ data });
  };

  transitionStatus = async (req: Request, res: Response): Promise<void> => {
    const id = String(req.params.id ?? "");
    const input = req.body as UpdateBookingStatusInput;
    const data = await this.service.transitionStatus(id, input);
    res.status(200).json({ data });
  };

  updatePayment = async (req: Request, res: Response): Promise<void> => {
    const id = String(req.params.id ?? "");
    const input = req.body as UpdateBookingPaymentInput;
    const data = await this.service.updatePayment(id, input);
    res.status(200).json({ data });
  };

  extendBooking = async (req: Request, res: Response): Promise<void> => {
    const id = String(req.params.id ?? "");
    const input = req.body as ExtendBookingInput;
    const data = await this.service.extendBooking(id, input);
    res.status(200).json({ data });
  };
}

