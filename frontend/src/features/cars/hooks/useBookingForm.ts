import { useQueryClient } from "@tanstack/react-query";
import { useMemo, useRef, useState, type FormEvent } from "react";
import { ddmmyyyyToYyyymmdd } from "@/features/bookings/utils/booking-admin";
import type {
  BookingItem,
  PaymentScheme,
} from "@/features/bookings/types/booking.types";
import { ApiError, apiFetch } from "@/lib/api";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import type { CarItem } from "../types/car.types";
import {
  buildBookingMessage,
  calculateRentalDays,
  getCalendarCells,
  hasBookedDateInRange,
  toISODate,
  toTimestamp,
  type RentalServiceType,
  type TransmissionPreference,
} from "../utils/booking";
import { PUBLIC_CARS_QUERY_KEY } from "./useAdminCars";

export function useBookingForm(car: CarItem, onSuccess: () => void) {
  const qc = useQueryClient();
  const today = useMemo(() => new Date(), []);
  const todayIso = useMemo(() => toISODate(today), [today]);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [serviceType, setServiceType] =
    useState<RentalServiceType>("SELF_DRIVE");
  const defaultTransmission: TransmissionPreference =
    car.transmission === "MATIC" ? "MATIC" : "MANUAL";
  const [transmissionPreference, setTransmissionPreference] =
    useState<TransmissionPreference>(defaultTransmission);
  const [paymentScheme, setPaymentScheme] = useState<PaymentScheme>("FULL");
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewDate, setViewDate] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const idempotencyKeyRef = useRef<string | null>(null);
  const submitLockRef = useRef(false);

  const bookedSet = useMemo(() => {
    const byTrans = car.bookedDatesByTransmission?.[transmissionPreference];
    return new Set(byTrans ?? car.bookedDates ?? []);
  }, [car.bookedDates, car.bookedDatesByTransmission, transmissionPreference]);

  const calendarCells = useMemo(
    () => getCalendarCells(viewDate.getFullYear(), viewDate.getMonth()),
    [viewDate]
  );

  const totalDays =
    startDate && endDate ? calculateRentalDays(startDate, endDate) : 0;
  const totalPrice = totalDays * car.pricePerDay;
  const isDpEligible = totalDays >= 3;
  const effectivePaymentScheme: PaymentScheme = isDpEligible
    ? paymentScheme
    : "FULL";
  const dpAmount =
    effectivePaymentScheme === "DP_50"
      ? Math.round(totalPrice * 0.5)
      : totalPrice;

  function resetIdempotencyKey() {
    idempotencyKeyRef.current = null;
  }

  function handleDateClick(iso: string) {
    setErrorMsg(null);
    resetIdempotencyKey();

    if (!startDate || (startDate && endDate)) {
      setStartDate(iso);
      setEndDate(null);
      return;
    }

    if (toTimestamp(iso) < toTimestamp(startDate)) {
      setStartDate(iso);
      return;
    }

    if (hasBookedDateInRange(startDate, iso, bookedSet)) {
      setErrorMsg("Rentang tanggal melewati jadwal yang sudah dibooking.");
      return;
    }

    setEndDate(iso);
  }

  function handlePrevMonth() {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  }

  function handleNextMonth() {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitLockRef.current) return;
    const trimmedName = name.trim();

    if (!trimmedName) {
      setErrorMsg("Nama wajib diisi.");
      return;
    }
    if (!startDate || !endDate) {
      setErrorMsg("Pilih tanggal mulai dan tanggal selesai.");
      return;
    }

    if (!idempotencyKeyRef.current) {
      idempotencyKeyRef.current =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `bk-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    }

    submitLockRef.current = true;
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const booking = await apiFetch<BookingItem>("/bookings", {
        method: "POST",
        headers: {
          "Idempotency-Key": idempotencyKeyRef.current,
        },
        body: JSON.stringify({
          carId: car.id,
          customerName: trimmedName,
          customerPhone: phone,
          startDate: ddmmyyyyToYyyymmdd(startDate),
          endDate: ddmmyyyyToYyyymmdd(endDate),
          serviceType,
          transmissionPreference,
          paymentScheme: effectivePaymentScheme,
        }),
      });

      await qc.invalidateQueries({ queryKey: PUBLIC_CARS_QUERY_KEY });

      const message = buildBookingMessage({
        car,
        name: trimmedName,
        phone: booking.customerPhone,
        bookingCode: booking.bookingCode,
        serviceType,
        transmissionPreference,
        paymentScheme: effectivePaymentScheme,
        startDate,
        endDate,
        totalDays,
        totalPrice,
      });

      window.open(buildWhatsAppUrl(message), "_blank", "noopener,noreferrer");
      setName("");
      setPhone("");
      setPaymentScheme("FULL");
      setStartDate(null);
      setEndDate(null);
      setErrorMsg(null);
      resetIdempotencyKey();
      onSuccess();
    } catch (err) {
      setErrorMsg(
        err instanceof ApiError
          ? err.message
          : "Gagal mengirim booking. Silakan coba lagi."
      );
    } finally {
      submitLockRef.current = false;
      setIsSubmitting(false);
    }
  }

  return {
    name,
    setName,
    phone,
    setPhone,
    serviceType,
    setServiceType,
    transmissionPreference,
    setTransmissionPreference,
    paymentScheme: effectivePaymentScheme,
    setPaymentScheme,
    isDpEligible,
    dpAmount,
    startDate,
    endDate,
    viewDate,
    todayIso,
    bookedSet,
    calendarCells,
    totalDays,
    totalPrice,
    errorMsg,
    isSubmitting,
    handleDateClick,
    handlePrevMonth,
    handleNextMonth,
    handleSubmit,
  };
}
