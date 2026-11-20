import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  createBookingRecord,
  ddmmyyyyToYyyymmdd,
  getBookedCalendarDatesForCar,
} from "@/features/bookings/utils/booking-admin";
import {
  readStoredBookings,
  subscribeStoredBookings,
  writeStoredBookings,
} from "@/features/bookings/utils/bookings-storage";
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
  const [phone, setPhone] = useState("");
  const [serviceType, setServiceType] =
    useState<RentalServiceType>("SELF_DRIVE");
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [viewDate, setViewDate] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [storedBookings, setStoredBookings] = useState(readStoredBookings);

  // Sinkronkan tanggal terblokir jika ada perubahan booking di tab/halaman lain.
  useEffect(() => {
    return subscribeStoredBookings(() => {
      setStoredBookings(readStoredBookings());
    });
  }, []);

  const bookedSet = useMemo(
    () =>
      new Set(
        getBookedCalendarDatesForCar(
          car.id,
          storedBookings,
          car.bookedDates ?? [],
        ),
      ),
    [car.id, car.bookedDates, storedBookings],
  );

  const calendarCells = useMemo(
    () => getCalendarCells(viewDate.getFullYear(), viewDate.getMonth()),
    [viewDate],
  );

  const totalDays =
    startDate && endDate ? calculateRentalDays(startDate, endDate) : 0;
  const totalPrice = totalDays * car.pricePerDay;

  // Atur rentang tanggal mulai–selesai dan tolak rentang yang menabrak jadwal terbooking.
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

  // Navigasi tampilan kalender ke bulan sebelumnya / berikutnya.
  function handlePrevMonth() {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  }

  function handleNextMonth() {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  }

  // Validasi input, simpan booking PENDING ke store, lalu arahkan ke WhatsApp admin.
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

    const latestBookings = readStoredBookings();
    const created = createBookingRecord(
      {
        customerName: trimmedName,
        customerPhone: phone,
        carId: car.id,
        carName: car.name,
        pricePerDay: car.pricePerDay,
        startDate: ddmmyyyyToYyyymmdd(startDate),
        endDate: ddmmyyyyToYyyymmdd(endDate),
        serviceType,
      },
      latestBookings,
    );

    if (!created.ok) {
      setErrorMsg(created.error);
      return;
    }

    writeStoredBookings(created.bookings);
    setStoredBookings(created.bookings);

    const message = buildBookingMessage({
      car,
      name: trimmedName,
      phone: created.booking.customerPhone,
      bookingCode: created.booking.bookingCode,
      serviceType,
      startDate,
      endDate,
      totalDays,
      totalPrice,
    });

    window.open(buildWhatsAppUrl(message), "_blank", "noopener,noreferrer");
    setName("");
    setPhone("");
    setStartDate(null);
    setEndDate(null);
    setErrorMsg(null);
    onSuccess();
  }

  return {
    name,
    setName,
    phone,
    setPhone,
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
