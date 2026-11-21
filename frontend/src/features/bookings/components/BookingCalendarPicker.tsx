import { CalendarDays } from "lucide-react";
import { useMemo, useState } from "react";
import { AvailabilityCalendar } from "@/features/cars/components/AvailabilityCalendar";
import {
  getCalendarCells,
  hasBookedDateInRange,
  toISODate,
  toTimestamp,
} from "@/features/cars/utils/booking";
import { cn } from "@/lib/utils";
import {
  ddmmyyyyToYyyymmdd,
  getBookedCalendarDatesForCar,
  yyyymmddToDdmmyyyy,
} from "../utils/booking-admin";
import {
  readStoredBookings,
  readStoredCars,
} from "../utils/bookings-storage";

interface BookingCalendarPickerProps {
  mode: "range" | "extend-end";
  carId: string;
  excludeBookingId?: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  minExtendEndDate?: string; // YYYY-MM-DD (current endDate when extending)
  onChangeRange?: (nextStart: string, nextEnd: string) => void;
  onChangeExtendEnd?: (nextEnd: string) => void;
  onError?: (message: string | null) => void;
}

/**
 * Pemilih tanggal visual berbasis AvailabilityCalendar untuk mode Edit Booking (range)
 * maupun Perpanjang Sewa (extend-end), menampilkan tanggal terbooking Unit secara langsung.
 */
export function BookingCalendarPicker({
  mode,
  carId,
  excludeBookingId,
  startDate,
  endDate,
  minExtendEndDate,
  onChangeRange,
  onChangeExtendEnd,
  onError,
}: BookingCalendarPickerProps) {
  const today = useMemo(() => new Date(), []);
  const todayIso = useMemo(() => toISODate(today), [today]);
  const [isOpen, setIsOpen] = useState(false);

  // Untuk mode range, izinkan pemilihan tanggal mulai sementara sebelum tanggal selesai dipilih.
  const [pendingStartIso, setPendingStartIso] = useState<string | null>(null);

  const initialMonthDate = useMemo(() => {
    const anchor = startDate || endDate;
    if (anchor) {
      const [y, m] = anchor.split("-").map(Number);
      if (y && m) return new Date(y, m - 1, 1);
    }
    return new Date(today.getFullYear(), today.getMonth(), 1);
  }, [startDate, endDate, today]);

  const [viewDate, setViewDate] = useState<Date>(initialMonthDate);

  const bookedSet = useMemo(() => {
    const allBookings = readStoredBookings().filter(
      (b) => b.id !== excludeBookingId
    );
    const car = readStoredCars().find((c) => c.id === carId);
    return new Set(
      getBookedCalendarDatesForCar(carId, allBookings, car?.bookedDates ?? [])
    );
  }, [carId, excludeBookingId]);

  const calendarCells = useMemo(
    () => getCalendarCells(viewDate.getFullYear(), viewDate.getMonth()),
    [viewDate]
  );

  const displayStartIso =
    pendingStartIso ?? (startDate ? yyyymmddToDdmmyyyy(startDate) : null);
  const displayEndIso = pendingStartIso
    ? null
    : endDate
      ? yyyymmddToDdmmyyyy(endDate)
      : null;

  function handleSelectDate(iso: string) {
    onError?.(null);

    if (mode === "extend-end") {
      const minIso = minExtendEndDate
        ? yyyymmddToDdmmyyyy(minExtendEndDate)
        : displayStartIso;
      if (minIso && toTimestamp(iso) <= toTimestamp(minIso)) {
        onError?.("Tanggal selesai baru harus setelah tanggal selesai saat ini.");
        return;
      }
      if (displayStartIso && hasBookedDateInRange(displayStartIso, iso, bookedSet)) {
        onError?.("Rentang perpanjangan menabrak jadwal booking lain.");
        return;
      }
      onChangeExtendEnd?.(ddmmyyyyToYyyymmdd(iso));
      setIsOpen(false);
      return;
    }

    // Mode range (edit tanggal mulai & selesai)
    if (!pendingStartIso) {
      setPendingStartIso(iso);
      return;
    }

    if (toTimestamp(iso) < toTimestamp(pendingStartIso)) {
      setPendingStartIso(iso);
      return;
    }

    if (hasBookedDateInRange(pendingStartIso, iso, bookedSet)) {
      onError?.("Rentang tanggal menabrak jadwal yang sudah dikonfirmasi.");
      return;
    }

    onChangeRange?.(ddmmyyyyToYyyymmdd(pendingStartIso), ddmmyyyyToYyyymmdd(iso));
    setPendingStartIso(null);
    setIsOpen(false);
  }

  return (
    <div className="space-y-2">
      {mode === "range" ? (
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className={cn(
              "flex h-8 items-center justify-between rounded-md border px-2.5 font-mono text-[11px] text-white transition-colors",
              isOpen
                ? "border-gold bg-carbon"
                : "border-hairline bg-carbon hover:border-gold/50"
            )}
          >
            <span>{startDate ? yyyymmddToDdmmyyyy(startDate) : "Mulai"}</span>
            <CalendarDays className="h-3.5 w-3.5 text-gold" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className={cn(
              "flex h-8 items-center justify-between rounded-md border px-2.5 font-mono text-[11px] text-white transition-colors",
              isOpen
                ? "border-gold bg-carbon"
                : "border-hairline bg-carbon hover:border-gold/50"
            )}
          >
            <span>{endDate ? yyyymmddToDdmmyyyy(endDate) : "Selesai"}</span>
            <CalendarDays className="h-3.5 w-3.5 text-gold" aria-hidden="true" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className={cn(
            "flex h-9 w-full items-center justify-between rounded-md border px-3 font-mono text-xs text-white transition-colors",
            isOpen
              ? "border-sky-400 bg-obsidian"
              : "border-hairline bg-obsidian hover:border-sky-400/60"
          )}
        >
          <span>{endDate ? yyyymmddToDdmmyyyy(endDate) : "Pilih tanggal selesai"}</span>
          <CalendarDays className="h-4 w-4 text-sky-300" aria-hidden="true" />
        </button>
      )}

      {isOpen && (
        <div className="rounded-xl border border-gold/25 bg-carbon p-3">
          <AvailabilityCalendar
            viewDate={viewDate}
            calendarCells={calendarCells}
            todayIso={todayIso}
            bookedSet={bookedSet}
            startDate={displayStartIso}
            endDate={displayEndIso}
            onSelectDate={handleSelectDate}
            onPrevMonth={() =>
              setViewDate(
                (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
              )
            }
            onNextMonth={() =>
              setViewDate(
                (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
              )
            }
          />
        </div>
      )}
    </div>
  );
}

