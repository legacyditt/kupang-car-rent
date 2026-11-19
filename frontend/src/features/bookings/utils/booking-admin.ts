import type { BookingItem, BookingStatus } from "../types/booking.types";

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
