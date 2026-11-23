import type {
  PaymentScheme,
  PaymentStatus,
  PrismaClient,
} from "../../generated/prisma/client.js";
import {
  formatUtcDateDdMmYyyy,
  formatUtcDateYyyyMmDd,
} from "../../utils/date.js";
import { computePaymentSummary } from "../bookings/booking.domain.js";

const PAYMENT_SCHEME_LABELS: Record<PaymentScheme, string> = {
  FULL: "Bayar Penuh",
  DP_50: "DP 50%",
};

const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  UNPAID: "Belum Bayar",
  DP_PAID: "DP Masuk",
  PAID: "Lunas",
};

export class FinanceService {
  constructor(private readonly prisma: PrismaClient) {}

  async getSummary(monthFilter: string = "ALL") {
    const paidBookings = await this.prisma.booking.findMany({
      where: {
        paymentStatus: { in: ["DP_PAID", "PAID"] },
      },
      orderBy: { startDate: "desc" },
    });

    const availableMonthsSet = new Set<string>();
    const rows = [];
    let totalPaid = 0;
    let totalRemaining = 0;
    let totalFinalPrice = 0;
    let dpCount = 0;
    let paidCount = 0;

    for (const b of paidBookings) {
      const startYmd = formatUtcDateYyyyMmDd(b.startDate);
      availableMonthsSet.add(startYmd.slice(0, 7));

      if (monthFilter !== "ALL" && !startYmd.startsWith(monthFilter)) {
        continue;
      }

      const summary = computePaymentSummary(
        b.finalPrice,
        b.paymentScheme,
        b.paymentStatus,
        b.paidAmount
      );

      totalPaid += summary.paidAmount;
      totalRemaining += summary.remainingAmount;
      totalFinalPrice += b.finalPrice;
      if (b.paymentStatus === "DP_PAID") dpCount += 1;
      if (b.paymentStatus === "PAID") paidCount += 1;

      rows.push({
        id: b.id,
        bookingCode: b.bookingCode,
        customerName: b.customerName,
        carName: b.carNameSnapshot,
        scheduleLabel: `${formatUtcDateDdMmYyyy(b.startDate)} s/d ${formatUtcDateDdMmYyyy(b.endDate)}`,
        totalDays: b.totalDays,
        paymentSchemeLabel: PAYMENT_SCHEME_LABELS[summary.paymentScheme],
        paymentStatus: b.paymentStatus,
        paymentStatusLabel: PAYMENT_STATUS_LABELS[b.paymentStatus],
        finalPrice: b.finalPrice,
        paidAmount: summary.paidAmount,
        remainingAmount: summary.remainingAmount,
        startDate: startYmd,
      });
    }

    return {
      rows,
      totalPaid,
      totalRemaining,
      totalFinalPrice,
      dpCount,
      paidCount,
      availableMonths: Array.from(availableMonthsSet).sort((a, b) =>
        b.localeCompare(a)
      ),
    };
  }
}

