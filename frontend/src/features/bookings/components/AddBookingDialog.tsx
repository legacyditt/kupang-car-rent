import { AlertTriangle, KeyRound, UserCheck } from "lucide-react";
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
import {
  SERVICE_TYPE_LABELS,
  type RentalServiceType,
} from "@/features/cars/utils/booking";
import { cn, formatRupiah } from "@/lib/utils";
import type { BookingItem } from "../types/booking.types";
import {
  calculateInclusiveDays,
  hasScheduleConflict,
  type CreateBookingInput,
} from "../utils/booking-admin";
import { readStoredCars } from "../utils/bookings-storage";

interface AddBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingBookings: BookingItem[];
  onCreateBooking: (
    input: CreateBookingInput
  ) =>
    | { ok: true; booking: BookingItem; conflict: BookingItem | null }
    | { ok: false; error: string };
}

function getTodayDateStr(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function AddBookingDialog({
  open,
  onOpenChange,
  existingBookings,
  onCreateBooking,
}: AddBookingDialogProps) {
  const cars = useMemo(() => (open ? readStoredCars() : []), [open]);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [carId, setCarId] = useState("");
  const [serviceType, setServiceType] =
    useState<RentalServiceType>("SELF_DRIVE");
  const [startDate, setStartDate] = useState(getTodayDateStr);
  const [endDate, setEndDate] = useState(getTodayDateStr);
  const [finalPriceInput, setFinalPriceInput] = useState("");
  const [isPriceOverridden, setIsPriceOverridden] = useState(false);
  const [internalNote, setInternalNote] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const defaultCar = cars[0];
    setCustomerName("");
    setCustomerPhone("");
    setCarId(defaultCar?.id ?? "");
    setServiceType("SELF_DRIVE");
    const today = getTodayDateStr();
    setStartDate(today);
    setEndDate(today);
    setIsPriceOverridden(false);
    setFinalPriceInput(defaultCar ? String(defaultCar.pricePerDay) : "0");
    setInternalNote("");
    setErrorMsg(null);
  }, [open, cars]);

  const selectedCar = useMemo(
    () => cars.find((c) => c.id === carId) ?? cars[0] ?? null,
    [cars, carId]
  );

  const totalDays = useMemo(
    () => calculateInclusiveDays(startDate, endDate),
    [startDate, endDate]
  );

  const estimatedPrice = selectedCar
    ? totalDays * selectedCar.pricePerDay
    : 0;

  useEffect(() => {
    if (!isPriceOverridden) {
      setFinalPriceInput(String(estimatedPrice));
    }
  }, [estimatedPrice, isPriceOverridden]);

  const scheduleConflict = useMemo(() => {
    if (!selectedCar || totalDays <= 0) return null;
    const preview: BookingItem = {
      id: "__preview__",
      bookingCode: "PREVIEW",
      customerName: customerName || "Preview",
      customerPhone,
      carId: selectedCar.id,
      carName: selectedCar.name,
      startDate,
      endDate,
      totalDays,
      serviceType,
      estimatedPrice,
      finalPrice: estimatedPrice,
      status: "PENDING",
      internalNote,
      createdAt: startDate,
    };
    return hasScheduleConflict(preview, existingBookings);
  }, [
    selectedCar,
    totalDays,
    customerName,
    customerPhone,
    startDate,
    endDate,
    serviceType,
    estimatedPrice,
    internalNote,
    existingBookings,
  ]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    if (!selectedCar) {
      setErrorMsg("Unit mobil belum tersedia.");
      return;
    }

    const parsedFinalPrice = Number(finalPriceInput);
    const result = onCreateBooking({
      customerName,
      customerPhone,
      carId: selectedCar.id,
      carName: selectedCar.name,
      pricePerDay: selectedCar.pricePerDay,
      startDate,
      endDate,
      serviceType,
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
              onChange={(e) => setCarId(e.target.value)}
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

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label
                htmlFor="add-booking-start"
                className="font-mono text-[10px] tracking-wider text-brand-muted uppercase"
              >
                Tanggal Mulai
              </Label>
              <Input
                id="add-booking-start"
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-10 border-hairline bg-obsidian font-mono text-xs text-white focus-visible:border-gold focus-visible:ring-0"
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="add-booking-end"
                className="font-mono text-[10px] tracking-wider text-brand-muted uppercase"
              >
                Tanggal Selesai
              </Label>
              <Input
                id="add-booking-end"
                type="date"
                required
                min={startDate}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-10 border-hairline bg-obsidian font-mono text-xs text-white focus-visible:border-gold focus-visible:ring-0"
              />
            </div>
          </div>

          {scheduleConflict && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-400/35 bg-amber-400/10 p-3 text-xs text-amber-200">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
              <p>
                Jadwal bentrok dengan{" "}
                <span className="font-mono font-bold">
                  {scheduleConflict.bookingCode}
                </span>{" "}
                ({scheduleConflict.customerName},{" "}
                {scheduleConflict.startDate} s/d {scheduleConflict.endDate}).
                Tetap bisa disimpan sebagai PENDING, tetapi Konfirmasi akan
                diblokir BR-09.
              </p>
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

