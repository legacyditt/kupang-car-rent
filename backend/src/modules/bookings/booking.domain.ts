import type {
  BookingStatus,
  PaymentScheme,
  PaymentStatus,
} from "../../generated/prisma/client.js";

export const DOWN_PAYMENT_MIN_DAYS = 3;

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  PENDING: "Menunggu",
  CONFIRMED: "Dikonfirmasi",
  IN_PROGRESS: "Sedang Jalan",
  COMPLETED: "Selesai",
  REJECTED: "Ditolak",
  CANCELLED: "Dibatalkan",
};

export const ALLOWED_STATUS_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  PENDING: ["CONFIRMED", "REJECTED", "CANCELLED"],
  CONFIRMED: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["COMPLETED"],
  COMPLETED: [],
  REJECTED: [],
  CANCELLED: [],
};

export function canTransitionStatus(
  from: BookingStatus,
  to: BookingStatus
): boolean {
  return ALLOWED_STATUS_TRANSITIONS[from].includes(to);
}

export function canUseDownPayment(totalDays: number): boolean {
  return totalDays >= DOWN_PAYMENT_MIN_DAYS;
}

export function computePaymentSummary(
  finalPrice: number,
  paymentScheme: PaymentScheme = "FULL",
  paymentStatus: PaymentStatus = "UNPAID",
  explicitPaidAmount?: number
): {
  paymentScheme: PaymentScheme;
  paymentStatus: PaymentStatus;
  dpAmount: number;
  paidAmount: number;
  remainingAmount: number;
} {
  const safePrice = Math.max(0, finalPrice);
  const dpAmount =
    paymentScheme === "DP_50" ? Math.round(safePrice * 0.5) : safePrice;

  let paidAmount = 0;
  if (explicitPaidAmount !== undefined && Number.isFinite(explicitPaidAmount)) {
    paidAmount = Math.max(0, Math.min(safePrice, explicitPaidAmount));
  } else if (paymentStatus === "PAID") {
    paidAmount = safePrice;
  } else if (paymentStatus === "DP_PAID") {
    paidAmount = dpAmount;
  }

  return {
    paymentScheme,
    paymentStatus,
    dpAmount,
    paidAmount,
    remainingAmount: Math.max(0, safePrice - paidAmount),
  };
}

export function getAllowedPaymentStatuses(
  bookingStatus: BookingStatus,
  paymentScheme: PaymentScheme = "FULL",
  currentPaymentStatus: PaymentStatus = "UNPAID"
): PaymentStatus[] {
  if (bookingStatus === "CONFIRMED") {
    return paymentScheme === "DP_50"
      ? ["UNPAID", "DP_PAID", "PAID"]
      : ["UNPAID", "PAID"];
  }

  if (bookingStatus === "IN_PROGRESS") {
    if (currentPaymentStatus === "PAID") return ["PAID"];
    if (currentPaymentStatus === "DP_PAID") return ["PAID"];
    return paymentScheme === "DP_50"
      ? ["UNPAID", "DP_PAID", "PAID"]
      : ["UNPAID", "PAID"];
  }

  return [currentPaymentStatus];
}

