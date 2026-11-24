import type {
  Car,
  CarStatus,
  PrismaClient,
} from "../../generated/prisma/client.js";

export class CarRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findAll(includeInactive: boolean): Promise<Car[]> {
    return this.prisma.car.findMany({
      where: includeInactive ? undefined : { status: { not: "INACTIVE" } },
      orderBy: { createdAt: "asc" },
    });
  }

  async findById(id: string): Promise<Car | null> {
    return this.prisma.car.findUnique({ where: { id } });
  }

  async findBySlug(slug: string): Promise<Car | null> {
    return this.prisma.car.findUnique({ where: { slug } });
  }

  /** Batch-loads active schedule ranges for a list of carIds (prevents N+1 queries). */
  async findActiveBookingRangesByCarIds(
    carIds: string[]
  ): Promise<Array<{ carId: string; startDate: Date; endDate: Date }>> {
    if (carIds.length === 0) return [];
    return this.prisma.booking.findMany({
      where: {
        carId: { in: carIds },
        status: { in: ["CONFIRMED", "IN_PROGRESS"] },
      },
      select: {
        carId: true,
        startDate: true,
        endDate: true,
      },
    });
  }

  async findConflictingBooking(
    carId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{ id: string; bookingCode: string } | null> {
    return this.prisma.booking.findFirst({
      where: {
        carId,
        status: { in: ["CONFIRMED", "IN_PROGRESS"] },
        startDate: { lte: endDate },
        endDate: { gte: startDate },
      },
      select: {
        id: true,
        bookingCode: true,
      },
    });
  }

  async countBookings(carId: string): Promise<number> {
    return this.prisma.booking.count({ where: { carId } });
  }

  async create(data: {
    slug: string;
    name: string;
    brand: string;
    category?: string;
    transmission?: string;
    description?: string;
    capacityLabel: string;
    pricePerDay: number;
    imageUrl: string;
    status: CarStatus;
  }): Promise<Car> {
    return this.prisma.car.create({ data });
  }

  async update(
    id: string,
    data: Partial<{
      slug: string;
      name: string;
      brand: string;
      category: string | null;
      transmission: string;
      description: string | null;
      capacityLabel: string;
      pricePerDay: number;
      imageUrl: string;
      status: CarStatus;
    }>
  ): Promise<Car> {
    return this.prisma.car.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.car.delete({ where: { id } });
  }
}

