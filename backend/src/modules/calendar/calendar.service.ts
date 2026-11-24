import type { PrismaClient } from "../../generated/prisma/client.js";
import { formatUtcDateYyyyMmDd } from "../../utils/date.js";
import type { CalendarQuery } from "./calendar.schema.js";

export class CalendarService {
  constructor(private readonly prisma: PrismaClient) {}

  async getMonthlyCalendar(query: CalendarQuery) {
    const now = new Date();
    const defaultMonth = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
    const month = query.month ?? defaultMonth;
    const [yearStr, monthStr] = month.split("-");
    const year = Number(yearStr);
    const monthIdx = Number(monthStr) - 1;

    const monthStart = new Date(Date.UTC(year, monthIdx, 1));
    const monthEnd = new Date(Date.UTC(year, monthIdx + 1, 0));

    const [cars, bookings] = await Promise.all([
      this.prisma.car.findMany({
        orderBy: { createdAt: "asc" },
        select: { id: true, name: true, slug: true, status: true },
      }),
      this.prisma.booking.findMany({
        where: {
          ...(query.carId ? { carId: query.carId } : {}),
          status: { in: ["PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED"] },
          startDate: { lte: monthEnd },
          endDate: { gte: monthStart },
        },
        orderBy: { startDate: "asc" },
      }),
    ]);

    return {
      month,
      cars,
      bookings: bookings.map((b) => ({
        id: b.id,
        bookingCode: b.bookingCode,
        carId: b.carId,
        carName: b.carNameSnapshot,
        customerName: b.customerName,
        customerPhone: b.customerPhone,
        startDate: formatUtcDateYyyyMmDd(b.startDate),
        endDate: formatUtcDateYyyyMmDd(b.endDate),
        totalDays: b.totalDays,
        serviceType: b.serviceType,
        status: b.status,
        paymentStatus: b.paymentStatus,
      })),
    };
  }
}

