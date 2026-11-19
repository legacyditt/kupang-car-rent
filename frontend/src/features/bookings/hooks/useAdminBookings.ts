import { useEffect, useMemo, useState } from "react";
import { INITIAL_BOOKINGS } from "../data/bookings.mock";
import type { BookingItem, BookingStatus } from "../types/booking.types";
import {
  countBookingsByStatus,
  filterBookings,
  hasScheduleConflict,
  transitionBookingStatus,
  type BookingFilterTab,
} from "../utils/booking-admin";

const STORAGE_KEY = "aventra-admin-bookings";

function loadInitialBookings(): BookingItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_BOOKINGS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0
      ? parsed
      : INITIAL_BOOKINGS;
  } catch {
    return INITIAL_BOOKINGS;
  }
}

export function useAdminBookings() {
  const [bookings, setBookings] = useState<BookingItem[]>(loadInitialBookings);
  const [statusFilter, setStatusFilter] = useState<BookingFilterTab>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
    } catch {
      // Ignore storage write failure in restricted contexts
    }
  }, [bookings]);

  const counts = useMemo(() => countBookingsByStatus(bookings), [bookings]);

  const filteredBookings = useMemo(
    () => filterBookings(bookings, statusFilter, searchQuery),
    [bookings, statusFilter, searchQuery]
  );

  const selectedBooking = useMemo(
    () => bookings.find((b) => b.id === selectedId) ?? null,
    [bookings, selectedId]
  );

  const selectedConflict = useMemo(
    () =>
      selectedBooking ? hasScheduleConflict(selectedBooking, bookings) : null,
    [selectedBooking, bookings]
  );

  const changeStatus = (
    bookingId: string,
    nextStatus: BookingStatus,
    updates?: { finalPrice?: number; internalNote?: string }
  ): { ok: true } | { ok: false; error: string } => {
    const result = transitionBookingStatus(
      bookings,
      bookingId,
      nextStatus,
      updates
    );
    if (!result.ok) {
      return result;
    }
    setBookings(result.bookings);
    return { ok: true };
  };

  const saveNotesAndPrice = (
    bookingId: string,
    updates: { finalPrice: number; internalNote: string }
  ) => {
    setBookings((prev) =>
      prev.map((item) =>
        item.id === bookingId
          ? {
              ...item,
              finalPrice: updates.finalPrice,
              internalNote: updates.internalNote,
            }
          : item
      )
    );
  };

  return {
    bookings,
    filteredBookings,
    counts,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    selectedBooking,
    selectedConflict,
    setSelectedId,
    changeStatus,
    saveNotesAndPrice,
  };
}

