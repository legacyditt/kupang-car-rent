import type {
  Booking,
  BookingStatus,
  Car,
  PaymentScheme,
  PaymentStatus,
  Prisma,
  PrismaClient,
  RentalServiceType,
} from "../../generated/prisma/client.js";

type DbClient = PrismaClient | Prisma.TransactionClient;

export class BookingRepository {
  constructor(private readonly prisma: PrismaClient) {}

  transaction<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
    return this.prisma.$transaction(fn);
  }

  findCarById(id: string, db: DbClient = this.prisma): Promise<Car | null> {
    return db.car.findUnique({ where: { id } });
  }

  findById(id: string, db: DbClient = this.prisma): Promise<Booking | null> {
    return db.booking.findUnique({ where: { id } });
  }

  findByBookingCode(
    bookingCode: string,
    db: DbClient = this.prisma
  ): Promise<Booking | null> {
    return db.booking.findUnique({ where: { bookingCode } });
  }

  findByIdempotencyKey(
    idempotencyKey: string,
    db: DbClient = this.prisma
  ): Promise<Booking | null> {
    return db.booking.findUnique({ where: { idempotencyKey } });
  }

  listAll(
    filter: { status?: BookingStatus; query?: string },
    db: DbClient = this.prisma
  ): Promise<Booking[]> {
    const q = filter.query?.trim();
    return db.booking.findMany({
      where: {
        ...(filter.status ? { status: filter.status } : {}),
        ...(q
          ? {
              OR: [
                { bookingCode: { contains: q, mode: "insensitive" } },
                { customerName: { contains: q, mode: "insensitive" } },
                { carNameSnapshot: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
    });
  }

  countByCodePrefix(prefix: string, db: DbClient = this.prisma): Promise<number> {
    return db.booking.count({
      where: { bookingCode: { startsWith: prefix } },
    });
  }

  create(
    data: {
      bookingCode: string;
      idempotencyKey?: string;
      carId: string;
      carNameSnapshot: string;
      customerName: string;
      customerPhone: string;
      startDate: Date;
      endDate: Date;
      totalDays: number;
      serviceType: RentalServiceType;
      pickupLocation?: string;
      customerNotes?: string;
      pricePerDaySnapshot: number;
      estimatedPrice: number;
      additionalFee: number;
      finalPrice: number;
      paymentScheme: PaymentScheme;
      paymentStatus: PaymentStatus;
      paidAmount: number;
      status: BookingStatus;
      internalNote: string;
    },
    db: DbClient = this.prisma
  ): Promise<Booking> {
    return db.booking.create({ data });
  }

  update(
    id: string,
    data: Prisma.BookingUpdateInput,
    db: DbClient = this.prisma
  ): Promise<Booking> {
    return db.booking.update({ where: { id }, data });
  }

  findScheduleConflict(
    params: {
      excludeBookingId: string;
      carId: string;
      startDate: Date;
      endDate: Date;
    },
    db: DbClient = this.prisma
  ): Promise<Booking | null> {
    return db.booking.findFirst({
      where: {
        id: { not: params.excludeBookingId },
        carId: params.carId,
        status: { in: ["CONFIRMED", "IN_PROGRESS"] },
        startDate: { lte: params.endDate },
        endDate: { gte: params.startDate },
      },
    });
  }
}

