import { CalendarDays, KeyRound, UserCheck } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AvailabilityCalendar } from "@/features/cars/components/AvailabilityCalendar";
import {
  calculateRentalDays,
  getCalendarCells,
  hasBookedDateInRange,
  SERVICE_TYPE_LABELS,
  toISODate,
  toTimestamp,
  type RentalServiceType,
} from "@/features/cars/utils/booking";
import { cn, formatRupiah } from "@/lib/utils";
import type { BookingItem, PaymentScheme } from "../types/booking.types";
import { useAdminCars } from "@/features/cars/hooks/useAdminCars";
import {
  canUseDownPayment,
  ddmmyyyyToYyyymmdd,
  getBookedCalendarDatesForCar,
  yyyymmddToDdmmyyyy,
  type CreateBookingInput,
} from "../utils/booking-admin";

interface AddBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingBookings: BookingItem[];
  initialCarId?: string;
  initialDate?: string; // YYYY-MM-DD
  onCreateBooking: (
    input: CreateBookingInput
  ) => Promise<
    | { ok: true; booking: BookingItem; conflict: BookingItem | null }
    | { ok: false; error: string }
  >;
}

export function AddBookingDialog({
  open,
  onOpenChange,
  existingBookings,
  initialCarId,
  initialDate,
  onCreateBooking,
}: AddBookingDialogProps) {
  const { cars } = useAdminCars();
  const today = useMemo(() => new Date(), []);
  const todayIso = useMemo(() => toISODate(today), [today]);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [carId, setCarId] = useState("");
  const [serviceType, setServiceType] =
    useState<RentalServiceType>("SELF_DRIVE");
  const [paymentScheme, setPaymentScheme] = useState<PaymentScheme>("FULL");
  const [startDate, setStartDate] = useState<string | null>(null); // DD-MM-YYYY
  const [endDate, setEndDate] = useState<string | null>(null); // DD-MM-YYYY
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [viewDate, setViewDate] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [finalPriceInput, setFinalPriceInput] = useState("0");
  const [isPriceOverridden, setIsPriceOverridden] = useState(false);
  const [internalNote, setInternalNote] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const defaultCar =
      (initialCarId ? cars.find((c) => c.id === initialCarId) : undefined) ??
      cars[0];
    setCustomerName("");
    setCustomerPhone("");
    setCarId(defaultCar?.id ?? "");
    setServiceType("SELF_DRIVE");
    setPaymentScheme("FULL");
    if (initialDate) {
      const formatted = yyyymmddToDdmmyyyy(initialDate);
      const [y, m] = initialDate.split("-").map(Number);
      setStartDate(formatted);
      setEndDate(formatted);
      setViewDate(new Date(y, (m || 1) - 1, 1));
    } else {
      setStartDate(null);
      setEndDate(null);
      setViewDate(new Date(today.getFullYear(), today.getMonth(), 1));
    }
    setIsCalendarOpen(false);
    setIsPriceOverridden(false);
    setFinalPriceInput("0");
    setInternalNote("");
    setErrorMsg(null);
  }, [open, cars, today, initialCarId, initialDate]);

  const selectedCar = useMemo(
    () => cars.find((c) => c.id === carId) ?? cars[0] ?? null,
    [cars, carId]
  );

  const bookedSet = useMemo(() => {
    if (!selectedCar) return new Set<string>();
    return new Set(
      getBookedCalendarDatesForCar(
        selectedCar.id,
        existingBookings,
        selectedCar.bookedDates ?? []
      )
    );
  }, [selectedCar, existingBookings]);

  const calendarCells = useMemo(
    () => getCalendarCells(viewDate.getFullYear(), viewDate.getMonth()),
    [viewDate]
  );

  const totalDays =
    startDate && endDate ? calculateRentalDays(startDate, endDate) : 0;

  const estimatedPrice = selectedCar
    ? totalDays * selectedCar.pricePerDay
    : 0;

  useEffect(() => {
    if (!isPriceOverridden) {
      setFinalPriceInput(String(estimatedPrice));
    }
  }, [estimatedPrice, isPriceOverridden]);

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
    setIsCalendarOpen(false);
  }

  function handleCarChange(nextCarId: string) {
    setCarId(nextCarId);
    setStartDate(null);
    setEndDate(null);
    setErrorMsg(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    if (!selectedCar) {
      setErrorMsg("Unit mobil belum tersedia.");
      return;
    }
    if (!startDate || !endDate) {
      setErrorMsg("Pilih tanggal mulai dan tanggal selesai pada kalender.");
      setIsCalendarOpen(true);
      return;
    }

    const parsedFinalPrice = Number(finalPriceInput);
    const result = await onCreateBooking({
      customerName,
      customerPhone,
      carId: selectedCar.id,
      carName: selectedCar.name,
      pricePerDay: selectedCar.pricePerDay,
      startDate: ddmmyyyyToYyyymmdd(startDate),
      endDate: ddmmyyyyToYyyymmdd(endDate),
      serviceType,
      paymentScheme: canUseDownPayment(totalDays) ? paymentScheme : "FULL",
      finalPrice:
        Number.isFinite(parsedFinalPrice) && parsedFinalPrice >= 0
          ? parsedFinalPrice
          : estimatedPrice,
      internalNote,
    });

    if (!result.ok) {
      setErrorMsg(result.error);
      return;
    }

    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto border-gold/25 bg-carbon text-white sm:max-w-lg">
        <DialogHeader className="text-left">
          <DialogTitle className="font-display text-lg font-bold tracking-tight text-white">
            Tambah Booking Manual
          </DialogTitle>
          <DialogDescription className="text-xs text-brand-muted">
            Catat permintaan sewa dari WhatsApp, telepon, atau walk-in sebagai
            PENDING.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-2 space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label
                htmlFor="add-booking-name"
                className="font-mono text-[10px] tracking-wider text-brand-muted uppercase"
              >
                Nama Pelanggan
              </Label>
              <Input
                id="add-booking-name"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Nama lengkap"
                className="h-10 border-hairline bg-obsidian text-sm text-white placeholder:text-brand-muted/60 focus-visible:border-gold focus-visible:ring-0"
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="add-booking-phone"
                className="font-mono text-[10px] tracking-wider text-brand-muted uppercase"
              >
                No. WhatsApp
              </Label>
              <Input
                id="add-booking-phone"
                type="tel"
                required
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="081234567890"
                className="h-10 border-hairline bg-obsidian text-sm text-white placeholder:text-brand-muted/60 focus-visible:border-gold focus-visible:ring-0"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="add-booking-car"
              className="font-mono text-[10px] tracking-wider text-brand-muted uppercase"
            >
              Pilih Unit
            </Label>
            <select
              id="add-booking-car"
              value={carId}
              onChange={(e) => handleCarChange(e.target.value)}
              className="h-10 w-full rounded-lg border border-hairline bg-obsidian px-3 text-sm text-white focus:border-gold focus:outline-none"
            >
              {cars.map((car) => (
                <option key={car.id} value={car.id}>
                  {car.name} — {formatRupiah(car.pricePerDay)}/hari
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label className="font-mono text-[10px] tracking-wider text-brand-muted uppercase">
              Jenis Layanan
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  {
                    value: "SELF_DRIVE",
                    label: SERVICE_TYPE_LABELS.SELF_DRIVE,
                    icon: KeyRound,
                  },
                  {
                    value: "WITH_DRIVER",
                    label: SERVICE_TYPE_LABELS.WITH_DRIVER,
                    icon: UserCheck,
                  },
                ] as const
              ).map((opt) => {
                const Icon = opt.icon;
                const active = serviceType === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setServiceType(opt.value)}
                    className={cn(
                      "flex h-10 items-center justify-center gap-2 rounded-lg border font-mono text-xs font-medium transition-colors",
                      active
                        ? "border-gold bg-gold/15 text-gold"
                        : "border-hairline bg-obsidian text-brand-muted hover:border-gold/40 hover:text-white"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date Triggers */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="font-mono text-[10px] tracking-wider text-brand-muted uppercase">
                Tanggal Mulai
              </Label>
              <button
                type="button"
                onClick={() => setIsCalendarOpen((prev) => !prev)}
                className={cn(
                  "flex h-10 w-full items-center justify-between rounded-lg border px-3 font-mono text-xs transition-colors",
                  isCalendarOpen
                    ? "border-gold bg-obsidian text-white"
                    : "border-hairline bg-obsidian text-white hover:border-gold/50"
                )}
              >
                <span className={startDate ? "text-white" : "text-brand-muted/70"}>
                  {startDate ?? "Pilih tanggal"}
                </span>
                <CalendarDays className="h-4 w-4 text-gold" aria-hidden="true" />
              </button>
            </div>

            <div className="space-y-1.5">
              <Label className="font-mono text-[10px] tracking-wider text-brand-muted uppercase">
                Tanggal Selesai
              </Label>
              <button
                type="button"
                onClick={() => setIsCalendarOpen((prev) => !prev)}
                className={cn(
                  "flex h-10 w-full items-center justify-between rounded-lg border px-3 font-mono text-xs transition-colors",
                  isCalendarOpen
                    ? "border-gold bg-obsidian text-white"
                    : "border-hairline bg-obsidian text-white hover:border-gold/50"
                )}
              >
                <span className={endDate ? "text-white" : "text-brand-muted/70"}>
                  {endDate ?? "Pilih tanggal"}
                </span>
                <CalendarDays className="h-4 w-4 text-gold" aria-hidden="true" />
              </button>
            </div>
          </div>

          {isCalendarOpen && (
            <div className="rounded-xl border border-gold/25 bg-obsidian/70 p-3.5">
              <AvailabilityCalendar
                viewDate={viewDate}
                calendarCells={calendarCells}
                todayIso={todayIso}
                bookedSet={bookedSet}
                startDate={startDate}
                endDate={endDate}
                onSelectDate={handleDateClick}
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

          <div className="grid grid-cols-1 gap-3 rounded-xl border border-hairline bg-obsidian p-3.5 sm:grid-cols-2 sm:items-end">
            <div>
              <p className="font-mono text-[10px] tracking-wider text-brand-muted uppercase">
                Estimasi ({totalDays} hari)
              </p>
              <p className="mt-1 font-mono text-sm font-bold text-white tabular-nums">
                {totalDays > 0 ? formatRupiah(estimatedPrice) : "—"}
              </p>
              {canUseDownPayment(totalDays) && (
                <div className="mt-2 flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPaymentScheme("FULL")}
                    className={cn(
                      "rounded border px-2 py-0.5 font-mono text-[10px]",
                      paymentScheme === "FULL"
                        ? "border-gold bg-gold/15 text-gold"
                        : "border-hairline text-brand-muted"
                    )}
                  >
                    Penuh
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentScheme("DP_50")}
                    className={cn(
                      "rounded border px-2 py-0.5 font-mono text-[10px]",
                      paymentScheme === "DP_50"
                        ? "border-gold bg-gold/15 text-gold"
                        : "border-hairline text-brand-muted"
                    )}
                  >
                    DP 50%
                  </button>
                </div>
              )}
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="add-booking-final-price"
                className="font-mono text-[10px] tracking-wider text-brand-muted uppercase"
              >
                Harga Final (Rp)
              </Label>
              <Input
                id="add-booking-final-price"
                type="number"
                min={0}
                step={25000}
                value={finalPriceInput}
                onChange={(e) => {
                  setIsPriceOverridden(true);
                  setFinalPriceInput(e.target.value);
                }}
                className="h-9 border-gold/35 bg-carbon font-mono text-xs font-bold text-gold focus-visible:border-gold focus-visible:ring-0"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="add-booking-note"
              className="font-mono text-[10px] tracking-wider text-brand-muted uppercase"
            >
              Catatan Internal Admin (Opsional)
            </Label>
            <textarea
              id="add-booking-note"
              rows={2}
              value={internalNote}
              onChange={(e) => setInternalNote(e.target.value)}
              placeholder="Lokasi serah terima, nama sopir, atau catatan khusus..."
              className="w-full rounded-lg border border-hairline bg-obsidian p-2.5 text-xs text-white placeholder:text-brand-muted/60 focus:border-gold focus:outline-none"
            />
          </div>

          {errorMsg && (
            <p className="rounded-lg border border-red-400/30 bg-red-400/10 p-2.5 font-mono text-xs text-red-300">
              {errorMsg}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-10 border-hairline bg-obsidian font-mono text-xs text-brand-muted hover:text-white"
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="h-10 bg-gold font-mono text-xs font-bold tracking-wider text-obsidian uppercase hover:bg-gold-light"
            >
              Simpan Booking (Pending)
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
