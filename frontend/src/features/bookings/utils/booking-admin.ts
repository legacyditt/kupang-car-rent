import type { RentalServiceType } from "../../cars/utils/booking";
import type {
  BookingItem,
  BookingStatus,
  PaymentScheme,
  PaymentStatus,
} from "../types/booking.types";

export type BookingFilterTab = "ALL" | BookingStatus;

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  PENDING: "Menunggu",
  CONFIRMED: "Dikonfirmasi",
  IN_PROGRESS: "Sedang Jalan",
  COMPLETED: "Selesai",
  REJECTED: "Ditolak",
  CANCELLED: "Dibatalkan",
};

export const ALLOWED_STATUS_TRANSITIONS: Record<
  BookingStatus,
  BookingStatus[]
> = {
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

/**
 * BR-09: Checks if `target` overlaps any CONFIRMED or IN_PROGRESS booking for the same car.
 */
export function hasScheduleConflict(
  target: BookingItem,
  allBookings: BookingItem[]
): BookingItem | null {
  return (
    allBookings.find(
      (other) =>
        other.id !== target.id &&
        other.carId === target.carId &&
        (other.status === "CONFIRMED" || other.status === "IN_PROGRESS") &&
        other.startDate <= target.endDate &&
        other.endDate >= target.startDate
    ) ?? null
  );
}

export function filterBookings(
  bookings: BookingItem[],
  statusFilter: BookingFilterTab,
  query: string
): BookingItem[] {
  const normalizedQuery = query.trim().toLowerCase();

  return bookings.filter((item) => {
    const matchesStatus =
      statusFilter === "ALL" || item.status === statusFilter;
    if (!matchesStatus) return false;
    if (!normalizedQuery) return true;

    return (
      item.bookingCode.toLowerCase().includes(normalizedQuery) ||
      item.customerName.toLowerCase().includes(normalizedQuery) ||
      item.carName.toLowerCase().includes(normalizedQuery)
    );
  });
}

export function countBookingsByStatus(
  bookings: BookingItem[]
): Record<BookingFilterTab, number> {
  return bookings.reduce<Record<BookingFilterTab, number>>(
    (acc, item) => {
      acc.ALL += 1;
      acc[item.status] += 1;
      return acc;
    },
    {
      ALL: 0,
      PENDING: 0,
      CONFIRMED: 0,
      IN_PROGRESS: 0,
      COMPLETED: 0,
      REJECTED: 0,
      CANCELLED: 0,
    }
  );
}

export function transitionBookingStatus(
  bookings: BookingItem[],
  bookingId: string,
  nextStatus: BookingStatus,
  updates?: { finalPrice?: number; internalNote?: string }
): { ok: true; bookings: BookingItem[] } | { ok: false; error: string } {
  const target = bookings.find((b) => b.id === bookingId);
  if (!target) {
    return { ok: false, error: "Data booking tidak ditemukan." };
  }

  if (!canTransitionStatus(target.status, nextStatus)) {
    return {
      ok: false,
      error: `Status ${BOOKING_STATUS_LABELS[target.status]} tidak dapat diubah ke ${BOOKING_STATUS_LABELS[nextStatus]}.`,
    };
  }

  if (nextStatus === "CONFIRMED") {
    const conflict = hasScheduleConflict(target, bookings);
    if (conflict) {
      return {
        ok: false,
        error: `Jadwal bentrok dengan ${conflict.bookingCode} (${conflict.customerName}, ${conflict.startDate} s/d ${conflict.endDate}).`,
      };
    }
  }

  const nextBookings = bookings.map((item) =>
    item.id === bookingId
      ? {
          ...item,
          status: nextStatus,
          finalPrice: updates?.finalPrice ?? item.finalPrice,
          internalNote: updates?.internalNote ?? item.internalNote,
        }
      : item
  );

  return { ok: true, bookings: nextBookings };
}

export function normalizeWhatsAppPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  if (digits.startsWith("62")) return digits;
  return `62${digits}`;
}

export function calculateInclusiveDays(
  startDate: string,
  endDate: string
): number {
  if (!startDate || !endDate || endDate < startDate) return 0;
  const [sy, sm, sd] = startDate.split("-").map(Number);
  const [ey, em, ed] = endDate.split("-").map(Number);
  const startMs = Date.UTC(sy, sm - 1, sd);
  const endMs = Date.UTC(ey, em - 1, ed);
  return Math.round((endMs - startMs) / 86_400_000) + 1;
}

export function ddmmyyyyToYyyymmdd(ddmmyyyy: string): string {
  const [d, m, y] = ddmmyyyy.split("-");
  if (!d || !m || !y) return ddmmyyyy;
  return `${y}-${m}-${d}`;
}

export function yyyymmddToDdmmyyyy(yyyymmdd: string): string {
  const [y, m, d] = yyyymmdd.split("-");
  if (!y || !m || !d) return yyyymmdd;
  return `${d}-${m}-${y}`;
}

function formatTodayYyyymmdd(now = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function generateBookingCode(existingBookings: BookingItem[]): string {
  const todayCompact = formatTodayYyyymmdd().replace(/-/g, "");
  let seq = existingBookings.length + 1;
  let candidate = `BK-${todayCompact}-A${String(seq).padStart(3, "0")}`;
  const existingCodes = new Set(existingBookings.map((b) => b.bookingCode));
  while (existingCodes.has(candidate)) {
    seq += 1;
    candidate = `BK-${todayCompact}-A${String(seq).padStart(3, "0")}`;
  }
  return candidate;
}

export const DOWN_PAYMENT_MIN_DAYS = 3;

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

export interface CreateBookingInput {
  customerName: string;
  customerPhone: string;
  carId: string;
  carName: string;
  pricePerDay: number;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  serviceType: RentalServiceType;
  paymentScheme?: PaymentScheme;
  finalPrice?: number;
  internalNote?: string;
}

export function createBookingRecord(
  input: CreateBookingInput,
  existingBookings: BookingItem[]
):
  | {
      ok: true;
      booking: BookingItem;
      bookings: BookingItem[];
      conflict: BookingItem | null;
    }
  | { ok: false; error: string } {
  const customerName = input.customerName.trim();
  const customerPhone = normalizeWhatsAppPhone(input.customerPhone);
  if (!customerName) {
    return { ok: false, error: "Nama pelanggan wajib diisi." };
  }
  if (customerPhone.length < 10) {
    return { ok: false, error: "Nomor WhatsApp pelanggan tidak valid." };
  }
  if (!input.carId || !input.carName) {
    return { ok: false, error: "Unit mobil wajib dipilih." };
  }
  const totalDays = calculateInclusiveDays(input.startDate, input.endDate);
  if (totalDays <= 0) {
    return {
      ok: false,
      error: "Tanggal selesai harus sama atau setelah tanggal mulai.",
    };
  }

  const estimatedPrice = totalDays * Math.max(0, input.pricePerDay);
  const finalPrice =
    input.finalPrice !== undefined && Number.isFinite(input.finalPrice)
      ? Math.max(0, input.finalPrice)
      : estimatedPrice;
  const paymentScheme: PaymentScheme =
    input.paymentScheme === "DP_50" && canUseDownPayment(totalDays)
      ? "DP_50"
      : "FULL";

  const booking: BookingItem = {
    id: `bk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    bookingCode: generateBookingCode(existingBookings),
    customerName,
    customerPhone,
    carId: input.carId,
    carName: input.carName,
    startDate: input.startDate,
    endDate: input.endDate,
    totalDays,
    serviceType: input.serviceType,
    estimatedPrice,
    finalPrice,
    paymentScheme,
    paymentStatus: "UNPAID",
    paidAmount: 0,
    status: "PENDING",
    internalNote: input.internalNote?.trim() ?? "",
    createdAt: formatTodayYyyymmdd(),
  };

  const conflict = hasScheduleConflict(booking, existingBookings);
  return {
    ok: true,
    booking,
    bookings: [booking, ...existingBookings],
    conflict,
  };
}

export interface UpdateBookingDetailsInput {
  customerName?: string;
  customerPhone?: string;
  carId?: string;
  carName?: string;
  pricePerDay?: number;
  startDate?: string;
  endDate?: string;
  serviceType?: RentalServiceType;
  finalPrice?: number;
  internalNote?: string;
}

export function updateBookingDetails(
  bookings: BookingItem[],
  bookingId: string,
  patch: UpdateBookingDetailsInput
): { ok: true; bookings: BookingItem[] } | { ok: false; error: string } {
  const target = bookings.find((b) => b.id === bookingId);
  if (!target) {
    return { ok: false, error: "Data booking tidak ditemukan." };
  }
  if (target.status !== "PENDING" && target.status !== "CONFIRMED") {
    return {
      ok: false,
      error: `Booking berstatus ${BOOKING_STATUS_LABELS[target.status]} tidak dapat diedit.`,
    };
  }

  const customerName =
    patch.customerName !== undefined
      ? patch.customerName.trim()
      : target.customerName;
  const customerPhone =
    patch.customerPhone !== undefined
      ? normalizeWhatsAppPhone(patch.customerPhone)
      : target.customerPhone;
  if (!customerName) {
    return { ok: false, error: "Nama pelanggan wajib diisi." };
  }
  if (patch.customerPhone !== undefined && customerPhone.length < 10) {
    return { ok: false, error: "Nomor WhatsApp pelanggan tidak valid." };
  }

  const startDate = patch.startDate ?? target.startDate;
  const endDate = patch.endDate ?? target.endDate;
  const totalDays = calculateInclusiveDays(startDate, endDate);
  if (totalDays <= 0) {
    return {
      ok: false,
      error: "Tanggal selesai harus sama atau setelah tanggal mulai.",
    };
  }

  const inferredDailyRate =
    target.totalDays > 0 ? target.estimatedPrice / target.totalDays : 0;
  const pricePerDay = patch.pricePerDay ?? inferredDailyRate;
  const estimatedPrice = totalDays * Math.max(0, pricePerDay);

  const wasOverridden = target.finalPrice !== target.estimatedPrice;
  const finalPrice =
    patch.finalPrice !== undefined && Number.isFinite(patch.finalPrice)
      ? Math.max(0, patch.finalPrice)
      : wasOverridden
        ? target.finalPrice
        : estimatedPrice;

  const updated: BookingItem = {
    ...target,
    customerName,
    customerPhone,
    carId: patch.carId ?? target.carId,
    carName: patch.carName ?? target.carName,
    startDate,
    endDate,
    totalDays,
    serviceType: patch.serviceType ?? target.serviceType,
    estimatedPrice,
    finalPrice,
    internalNote: patch.internalNote ?? target.internalNote,
  };

  if (updated.status === "CONFIRMED") {
    const conflict = hasScheduleConflict(updated, bookings);
    if (conflict) {
      return {
        ok: false,
        error: `Jadwal bentrok dengan ${conflict.bookingCode} (${conflict.customerName}, ${conflict.startDate} s/d ${conflict.endDate}).`,
      };
    }
  }

  return {
    ok: true,
    bookings: bookings.map((item) => (item.id === bookingId ? updated : item)),
  };
}

export function getBookedCalendarDatesForCar(
  carId: string,
  bookings: BookingItem[],
  fallbackDates: string[] = []
): string[] {
  const result = new Set<string>(fallbackDates);

  for (const booking of bookings) {
    if (
      booking.carId !== carId ||
      (booking.status !== "CONFIRMED" && booking.status !== "IN_PROGRESS")
    ) {
      continue;
    }

    const [sy, sm, sd] = booking.startDate.split("-").map(Number);
    const [ey, em, ed] = booking.endDate.split("-").map(Number);
    const cursor = new Date(Date.UTC(sy, sm - 1, sd));
    const end = new Date(Date.UTC(ey, em - 1, ed));

    while (cursor <= end) {
      const y = cursor.getUTCFullYear();
      const m = String(cursor.getUTCMonth() + 1).padStart(2, "0");
      const d = String(cursor.getUTCDate()).padStart(2, "0");
      result.add(`${d}-${m}-${y}`);
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
  }

  return Array.from(result);
}

