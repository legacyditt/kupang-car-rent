import type {
  Booking,
  PrismaClient,
  Testimonial,
  TestimonialStatus,
} from "../../generated/prisma/client.js";

export class TestimonialRepository {
  constructor(private readonly prisma: PrismaClient) {}

  findPublished(): Promise<Testimonial[]> {
    return this.prisma.testimonial.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { createdAt: "desc" },
    });
  }

  findAll(): Promise<Testimonial[]> {
    return this.prisma.testimonial.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  findById(id: string): Promise<Testimonial | null> {
    return this.prisma.testimonial.findUnique({ where: { id } });
  }

  findByBookingCode(bookingCode: string): Promise<Testimonial | null> {
    return this.prisma.testimonial.findUnique({ where: { bookingCode } });
  }

  findBookingByCode(bookingCode: string): Promise<Booking | null> {
    return this.prisma.booking.findUnique({ where: { bookingCode } });
  }

  create(data: {
    bookingId?: string;
    bookingCode?: string;
    customerName: string;
    carName: string;
    tripLabel: string;
    rating: number;
    quote: string;
    status: TestimonialStatus;
  }): Promise<Testimonial> {
    return this.prisma.testimonial.create({ data });
  }

  update(
    id: string,
    data: Partial<{
      customerName: string;
      carName: string;
      tripLabel: string;
      rating: number;
      quote: string;
      status: TestimonialStatus;
    }>
  ): Promise<Testimonial> {
    return this.prisma.testimonial.update({ where: { id }, data });
  }

  delete(id: string): Promise<void> {
    return this.prisma.testimonial.delete({ where: { id } }).then(() => undefined);
  }
}

