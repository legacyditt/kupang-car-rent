import type {
  Car,
  CarStatus,
  CarUnit,
  PrismaClient,
  TransmissionPreference,
} from "../../generated/prisma/client.js";

export type CarWithUnits = Car & { units: CarUnit[] };

export class CarRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findAll(includeInactive: boolean): Promise<CarWithUnits[]> {
    return this.prisma.car.findMany({
      where: includeInactive ? undefined : { status: { not: "INACTIVE" } },
      include: {
        units: { orderBy: { createdAt: "asc" } },
      },
      orderBy: { createdAt: "asc" },
    });
  }

  async findById(id: string): Promise<CarWithUnits | null> {
    return this.prisma.car.findUnique({
      where: { id },
      include: { units: { orderBy: { createdAt: "asc" } } },
    });
  }

  async findBySlug(slug: string): Promise<CarWithUnits | null> {
    return this.prisma.car.findUnique({
      where: { slug },
      include: { units: { orderBy: { createdAt: "asc" } } },
    });
  }

  /** Batch-loads active schedule ranges with carUnitId (prevents N+1 queries). */
  async findActiveBookingRangesByCarIds(
    carIds: string[]
  ): Promise<
    Array<{
      carId: string;
      carUnitId: string | null;
      startDate: Date;
      endDate: Date;
    }>
  > {
    if (carIds.length === 0) return [];
    return this.prisma.booking.findMany({
      where: {
        carId: { in: carIds },
        status: { in: ["CONFIRMED", "IN_PROGRESS"] },
      },
      select: {
        carId: true,
        carUnitId: true,
        startDate: true,
        endDate: true,
      },
    });
  }

  async findConflictingUnitIds(
    unitIds: string[],
    startDate: Date,
    endDate: Date
  ): Promise<string[]> {
    if (unitIds.length === 0) return [];
    const rows = await this.prisma.booking.findMany({
      where: {
        carUnitId: { in: unitIds },
        status: { in: ["CONFIRMED", "IN_PROGRESS"] },
        startDate: { lte: endDate },
        endDate: { gte: startDate },
      },
      select: { carUnitId: true },
    });
    return rows.map((r) => r.carUnitId).filter((id): id is string => Boolean(id));
  }

  async countBookings(carId: string): Promise<number> {
    return this.prisma.booking.count({ where: { carId } });
  }

  async createWithInitialUnit(
    data: {
      slug: string;
      name: string;
      brand: string;
      transmission: string;
      description?: string;
      capacityLabel: string;
      pricePerDay: number;
      imageUrl: string;
      status: CarStatus;
    },
    unitData: {
      label: string;
      plateNumber: string;
      transmission: TransmissionPreference;
      status: CarStatus;
    }
  ): Promise<CarWithUnits> {
    return this.prisma.car.create({
      data: {
        ...data,
        units: {
          create: unitData,
        },
      },
      include: { units: { orderBy: { createdAt: "asc" } } },
    });
  }

  async update(
    id: string,
    data: Partial<{
      slug: string;
      name: string;
      brand: string;
      transmission: string;
      description: string | null;
      capacityLabel: string;
      pricePerDay: number;
      imageUrl: string;
      status: CarStatus;
    }>
  ): Promise<CarWithUnits> {
    return this.prisma.car.update({
      where: { id },
      data,
      include: { units: { orderBy: { createdAt: "asc" } } },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.car.delete({ where: { id } });
  }

  // CarUnit CRUD
  findUnitById(id: string): Promise<CarUnit | null> {
    return this.prisma.carUnit.findUnique({ where: { id } });
  }

  createUnit(data: {
    carId: string;
    label: string;
    plateNumber: string;
    transmission: TransmissionPreference;
    status: CarStatus;
  }): Promise<CarUnit> {
    return this.prisma.carUnit.create({ data });
  }

  updateUnit(
    id: string,
    data: Partial<{
      label: string;
      plateNumber: string;
      transmission: TransmissionPreference;
      status: CarStatus;
    }>
  ): Promise<CarUnit> {
    return this.prisma.carUnit.update({ where: { id }, data });
  }

  countUnitBookings(carUnitId: string): Promise<number> {
    return this.prisma.booking.count({ where: { carUnitId } });
  }

  async deleteUnit(id: string): Promise<void> {
    await this.prisma.carUnit.delete({ where: { id } });
  }
}
