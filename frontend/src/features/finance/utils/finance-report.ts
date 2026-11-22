import type { BookingItem } from "../../bookings/types/booking.types";
import {
  computePaymentSummary,
  PAYMENT_SCHEME_LABELS,
  PAYMENT_STATUS_LABELS,
  yyyymmddToDdmmyyyy,
} from "../../bookings/utils/booking-admin.ts";

export interface FinanceRow {
  id: string;
  bookingCode: string;
  customerName: string;
  carName: string;
  scheduleLabel: string;
  totalDays: number;
  paymentSchemeLabel: string;
  paymentStatus: "DP_PAID" | "PAID";
  paymentStatusLabel: string;
  finalPrice: number;
  paidAmount: number;
  remainingAmount: number;
  startDate: string; // YYYY-MM-DD
}

export interface FinanceReport {
  rows: FinanceRow[];
  totalPaid: number;
  totalRemaining: number;
  totalFinalPrice: number;
  dpCount: number;
  paidCount: number;
}

const MONTH_LABELS: Record<string, string> = {
  "01": "Januari",
  "02": "Februari",
  "03": "Maret",
  "04": "April",
  "05": "Mei",
  "06": "Juni",
  "07": "Juli",
  "08": "Agustus",
  "09": "September",
  "10": "Oktober",
  "11": "November",
  "12": "Desember",
};

export function formatMonthLabel(monthKey: string): string {
  if (monthKey === "ALL") return "Semua Periode";
  const [y, m] = monthKey.split("-");
  return `${MONTH_LABELS[m] ?? m} ${y}`;
}

/** Mengambil daftar unik bulan (YYYY-MM) dari booking yang sudah memiliki uang masuk. */
export function getAvailableReportMonths(bookings: BookingItem[]): string[] {
  const months = new Set<string>();
  for (const b of bookings) {
    if (b.paymentStatus !== "DP_PAID" && b.paymentStatus !== "PAID") continue;
    if (b.startDate.length >= 7) {
      months.add(b.startDate.slice(0, 7));
    }
  }
  return Array.from(months).sort((a, b) => b.localeCompare(a));
}

/**
 * Membangun laporan rekap keuangan hanya dari booking yang sudah ada uang masuk (DP_PAID / PAID).
 */
export function buildFinanceReport(
  bookings: BookingItem[],
  monthFilter: string = "ALL"
): FinanceReport {
  const rows: FinanceRow[] = [];
  let totalPaid = 0;
  let totalRemaining = 0;
  let totalFinalPrice = 0;
  let dpCount = 0;
  let paidCount = 0;

  for (const b of bookings) {
    if (b.paymentStatus !== "DP_PAID" && b.paymentStatus !== "PAID") continue;
    if (monthFilter !== "ALL" && !b.startDate.startsWith(monthFilter)) continue;

    const summary = computePaymentSummary(
      b.finalPrice,
      b.paymentScheme ?? "FULL",
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
      carName: b.carName,
      scheduleLabel: `${yyyymmddToDdmmyyyy(b.startDate)} s/d ${yyyymmddToDdmmyyyy(b.endDate)}`,
      totalDays: b.totalDays,
      paymentSchemeLabel: PAYMENT_SCHEME_LABELS[summary.paymentScheme],
      paymentStatus: b.paymentStatus,
      paymentStatusLabel: PAYMENT_STATUS_LABELS[b.paymentStatus],
      finalPrice: b.finalPrice,
      paidAmount: summary.paidAmount,
      remainingAmount: summary.remainingAmount,
      startDate: b.startDate,
    });
  }

  return {
    rows,
    totalPaid,
    totalRemaining,
    totalFinalPrice,
    dpCount,
    paidCount,
  };
}
