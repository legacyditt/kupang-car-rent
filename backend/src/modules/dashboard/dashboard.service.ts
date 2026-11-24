import type { PrismaClient } from "../../generated/prisma/client.js";
import { formatUtcDateYyyyMmDd } from "../../utils/date.js";

export class DashboardService {
  constructor(private readonly prisma: PrismaClient) {}

  async getSummary() {
    const [carGroups, bookingGroups, recentBookings, upcomingSchedules] =
      await Promise.all([
        this.prisma.car.groupBy({
          by: ["status"],
          _count: { _all: true },
        }),
        this.prisma.booking.groupBy({
          by: ["status"],
          _count: { _all: true },
        }),
        this.prisma.booking.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
        }),
        this.prisma.booking.findMany({
          where: { status: { in: ["CONFIRMED", "IN_PROGRESS"] } },
          take: 5,
          orderBy: { startDate: "asc" },
        }),
      ]);

    const carCounts = {
      AVAILABLE: 0,
      RENTED: 0,
      MAINTENANCE: 0,
      INACTIVE: 0,
    };
    let totalCars = 0;
    for (const g of carGroups) {
      carCounts[g.status] = g._count._all;
      totalCars += g._count._all;
    }

    const bookingCounts = {
      PENDING: 0,
      CONFIRMED: 0,
      IN_PROGRESS: 0,
      COMPLETED: 0,
      REJECTED: 0,
      CANCELLED: 0,
    };
    let totalBookings = 0;
    for (const g of bookingGroups) {
      bookingCounts[g.status] = g._count._all;
      totalBookings += g._count._all;
    }

    const mapBookingSummary = (b: (typeof recentBookings)[number]) => ({
      id: b.id,
      bookingCode: b.bookingCode,
      customerName: b.customerName,
      carName: b.carNameSnapshot,
      startDate: formatUtcDateYyyyMmDd(b.startDate),
      endDate: formatUtcDateYyyyMmDd(b.endDate),
      finalPrice: b.finalPrice,
      status: b.status,
      paymentStatus: b.paymentStatus,
    });

    return {
      carStats: {
        total: totalCars,
        available: carCounts.AVAILABLE,
        rented: carCounts.RENTED,
        maintenance: carCounts.MAINTENANCE,
        inactive: carCounts.INACTIVE,
      },
      bookingStats: {
        total: totalBookings,
        pending: bookingCounts.PENDING,
        confirmed: bookingCounts.CONFIRMED,
        inProgress: bookingCounts.IN_PROGRESS,
        completed: bookingCounts.COMPLETED,
        rejected: bookingCounts.REJECTED,
        cancelled: bookingCounts.CANCELLED,
      },
      recentBookings: recentBookings.map(mapBookingSummary),
      upcomingSchedules: upcomingSchedules.map(mapBookingSummary),
    };
  }
}

