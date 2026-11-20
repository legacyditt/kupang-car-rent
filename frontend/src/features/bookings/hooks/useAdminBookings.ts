import { useEffect, useMemo, useState } from "react";
import type { BookingItem, BookingStatus } from "../types/booking.types";
import {
  countBookingsByStatus,
  createBookingRecord,
  filterBookings,
  hasScheduleConflict,
  transitionBookingStatus,
  updateBookingDetails,
  type BookingFilterTab,
  type CreateBookingInput,
  type UpdateBookingDetailsInput,
} from "../utils/booking-admin";
import {
  readStoredBookings,
  subscribeStoredBookings,
  writeStoredBookings,
} from "../utils/bookings-storage";

export function useAdminBookings() {
  const [bookings, setBookings] = useState<BookingItem[]>(readStoredBookings);
  const [statusFilter, setStatusFilter] = useState<BookingFilterTab>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    return subscribeStoredBookings(() => {
      setBookings(readStoredBookings());
    });
  }, []);

  const persistBookings = (next: BookingItem[]) => {
    setBookings(next);
    writeStoredBookings(next);
  };

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
    persistBookings(result.bookings);
    return { ok: true };
  };

  const saveNotesAndPrice = (
    bookingId: string,
    updates: { finalPrice: number; internalNote: string }
  ) => {
    const next = bookings.map((item) =>
      item.id === bookingId
        ? {
            ...item,
            finalPrice: updates.finalPrice,
            internalNote: updates.internalNote,
          }
        : item
    );
    persistBookings(next);
  };

  const addBooking = (
    input: CreateBookingInput
  ):
    | { ok: true; booking: BookingItem; conflict: BookingItem | null }
    | { ok: false; error: string } => {
    const result = createBookingRecord(input, bookings);
    if (!result.ok) {
      return result;
    }
    persistBookings(result.bookings);
    return { ok: true, booking: result.booking, conflict: result.conflict };
  };

  const editBooking = (
    bookingId: string,
    patch: UpdateBookingDetailsInput
  ): { ok: true } | { ok: false; error: string } => {
    const result = updateBookingDetails(bookings, bookingId, patch);
    if (!result.ok) {
      return result;
    }
    persistBookings(result.bookings);
    return { ok: true };
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
    addBooking,
    editBooking,
  };
}

