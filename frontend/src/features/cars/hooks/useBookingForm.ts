import { useMemo, useState, type FormEvent } from "react";
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
} from "../utils/booking";

export function useBookingForm(car: CarItem, onSuccess: () => void) {
  const today = useMemo(() => new Date(), []);
  const todayIso = useMemo(() => toISODate(today), [today]);

  const [name, setName] = useState("");
  const [serviceType, setServiceType] =
    useState<RentalServiceType>("SELF_DRIVE");
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [viewDate, setViewDate] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  );

  const bookedSet = useMemo(
    () => new Set(car.bookedDates ?? []),
    [car.bookedDates],
  );

  const calendarCells = useMemo(
    () => getCalendarCells(viewDate.getFullYear(), viewDate.getMonth()),
    [viewDate],
  );

  const totalDays =
    startDate && endDate ? calculateRentalDays(startDate, endDate) : 0;
  const totalPrice = totalDays * car.pricePerDay;

  function handleDateClick(iso: string) {
    setErrorMsg(null);

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

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();

    if (!trimmedName) {
      setErrorMsg("Nama wajib diisi.");
      return;
    }
    if (!startDate || !endDate) {
      setErrorMsg("Pilih tanggal mulai dan tanggal selesai.");
      return;
    }

    const message = buildBookingMessage({
      car,
      name: trimmedName,
      serviceType,
      startDate,
      endDate,
      totalDays,
      totalPrice,
    });

    window.open(buildWhatsAppUrl(message), "_blank", "noopener,noreferrer");
    onSuccess();
  }

  return {
    name,
    setName,
    serviceType,
    setServiceType,
    startDate,
    endDate,
    viewDate,
    todayIso,
    bookedSet,
    calendarCells,
    totalDays,
    totalPrice,
    errorMsg,
    handleDateClick,
    handlePrevMonth,
    handleNextMonth,
    handleSubmit,
  };
}
