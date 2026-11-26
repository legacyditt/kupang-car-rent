import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ApiError, apiFetch } from "@/lib/api";
import { notifyError, notifySuccess, notifyWarning } from "@/lib/notify";
import {
  ADMIN_CARS_QUERY_KEY,
  PUBLIC_CARS_QUERY_KEY,
} from "@/features/cars/hooks/useAdminCars";
import type {
  BookingItem,
  BookingStatus,
  PaymentScheme,
  PaymentStatus,
} from "../types/booking.types";
import {
  BOOKING_STATUS_LABELS,
  countBookingsByStatus,
  filterBookings,
  hasScheduleConflict,
  type BookingFilterTab,
  type CreateBookingInput,
  type UpdateBookingDetailsInput,
} from "../utils/booking-admin";

export const ADMIN_BOOKINGS_QUERY_KEY = ["admin-bookings"] as const;

export function useAdminBookings() {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<BookingFilterTab>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ADMIN_BOOKINGS_QUERY_KEY,
    queryFn: () => apiFetch<BookingItem[]>("/admin/bookings"),
  });

  const invalidateAll = async () => {
    await Promise.all([
      qc.invalidateQueries({ queryKey: ADMIN_BOOKINGS_QUERY_KEY }),
      qc.invalidateQueries({ queryKey: ADMIN_CARS_QUERY_KEY }),
      qc.invalidateQueries({ queryKey: PUBLIC_CARS_QUERY_KEY }),
      qc.invalidateQueries({ queryKey: ["admin-dashboard"] }),
    ]);
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

  const changeStatus = async (
    bookingId: string,
    nextStatus: BookingStatus,
    updates?: { finalPrice?: number; internalNote?: string; carUnitId?: string }
  ): Promise<{ ok: true } | { ok: false; error: string }> => {
    try {
      await apiFetch<BookingItem>(`/admin/bookings/${bookingId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: nextStatus, ...updates }),
      });
      await invalidateAll();
      notifySuccess(`Status diubah ke ${BOOKING_STATUS_LABELS[nextStatus]}`);
      return { ok: true };
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Gagal mengubah status.";
      notifyError("Gagal mengubah status", message);
      return { ok: false, error: message };
    }
  };

  const saveNotesAndPrice = async (
    bookingId: string,
    updates: { finalPrice: number; internalNote: string }
  ): Promise<{ ok: true } | { ok: false; error: string }> => {
    try {
      await apiFetch<BookingItem>(`/admin/bookings/${bookingId}`, {
        method: "PATCH",
        body: JSON.stringify(updates),
      });
      await invalidateAll();
      notifySuccess("Catatan & harga disimpan");
      return { ok: true };
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Gagal menyimpan perubahan.";
      notifyError("Gagal menyimpan perubahan", message);
      return { ok: false, error: message };
    }
  };

  const addBooking = async (
    input: CreateBookingInput
  ): Promise<
    | { ok: true; booking: BookingItem; conflict: BookingItem | null }
    | { ok: false; error: string }
  > => {
    try {
      const booking = await apiFetch<BookingItem>("/admin/bookings", {
        method: "POST",
        body: JSON.stringify({
          carId: input.carId,
          customerName: input.customerName,
          customerPhone: input.customerPhone,
          startDate: input.startDate,
          endDate: input.endDate,
          serviceType: input.serviceType,
          transmissionPreference: input.transmissionPreference ?? "MANUAL",
          paymentScheme: input.paymentScheme,
          finalPrice: input.finalPrice,
          internalNote: input.internalNote,
        }),
      });
      await invalidateAll();
      const conflict = hasScheduleConflict(booking, bookings);
      if (conflict) {
        notifyWarning(
          "Booking ditambahkan dengan bentrok jadwal",
          `Kode ${booking.bookingCode} bentrok dengan ${conflict.bookingCode}.`
        );
      } else {
        notifySuccess(
          "Booking berhasil ditambahkan",
          `Kode ${booking.bookingCode}`
        );
      }
      return { ok: true, booking, conflict };
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Gagal menambahkan booking.";
      notifyError("Gagal menambahkan booking", message);
      return { ok: false, error: message };
    }
  };

  const editBooking = async (
    bookingId: string,
    patch: UpdateBookingDetailsInput
  ): Promise<{ ok: true } | { ok: false; error: string }> => {
    try {
      await apiFetch<BookingItem>(`/admin/bookings/${bookingId}`, {
        method: "PATCH",
        body: JSON.stringify({
          customerName: patch.customerName,
          customerPhone: patch.customerPhone,
          carId: patch.carId,
          startDate: patch.startDate,
          endDate: patch.endDate,
          serviceType: patch.serviceType,
          transmissionPreference: patch.transmissionPreference,
          finalPrice: patch.finalPrice,
          internalNote: patch.internalNote,
        }),
      });
      await invalidateAll();
      notifySuccess("Detail booking diperbarui");
      return { ok: true };
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Gagal mengedit booking.";
      notifyError("Gagal mengedit booking", message);
      return { ok: false, error: message };
    }
  };

  const updatePayment = async (
    bookingId: string,
    updates: { paymentScheme: PaymentScheme; paymentStatus: PaymentStatus }
  ): Promise<{ ok: true } | { ok: false; error: string }> => {
    try {
      await apiFetch<BookingItem>(`/admin/bookings/${bookingId}/payment`, {
        method: "PATCH",
        body: JSON.stringify(updates),
      });
      await invalidateAll();
      notifySuccess(
        "Pembayaran diperbarui",
        `Status: ${
          updates.paymentStatus === "PAID"
            ? "Lunas"
            : updates.paymentStatus === "DP_PAID"
              ? "DP Terbayar"
              : "Belum Bayar"
        }`
      );
      return { ok: true };
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Gagal mengubah pembayaran.";
      notifyError("Gagal mengubah pembayaran", message);
      return { ok: false, error: message };
    }
  };

  const extendBooking = async (
    bookingId: string,
    newEndDate: string,
    overrideFinalPrice?: number
  ): Promise<{ ok: true } | { ok: false; error: string }> => {
    try {
      await apiFetch<BookingItem>(`/admin/bookings/${bookingId}/extend`, {
        method: "POST",
        body: JSON.stringify({ newEndDate, overrideFinalPrice }),
      });
      await invalidateAll();
      notifySuccess(
        "Sewa berhasil diperpanjang",
        `Tanggal selesai baru: ${newEndDate}`
      );
      return { ok: true };
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Gagal memperpanjang sewa.";
      notifyError("Gagal memperpanjang sewa", message);
      return { ok: false, error: message };
    }
  };

  return {
    bookings,
    isLoading,
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
    updatePayment,
    extendBooking,
  };
}
