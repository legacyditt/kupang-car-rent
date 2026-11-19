import * as DialogPrimitive from "@radix-ui/react-dialog";
import { KeyRound, UserCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, formatRupiah } from "@/lib/utils";
import type { CarItem } from "../types/car.types";
import { useBookingForm } from "../hooks/useBookingForm";
import {
  SERVICE_TYPE_LABELS,
  type RentalServiceType,
} from "../utils/booking";
import { AvailabilityCalendar } from "./AvailabilityCalendar";

const SERVICE_OPTIONS: Array<{
  value: RentalServiceType;
  label: string;
  icon: typeof KeyRound;
}> = [
  { value: "SELF_DRIVE", label: SERVICE_TYPE_LABELS.SELF_DRIVE, icon: KeyRound },
  {
    value: "WITH_DRIVER",
    label: SERVICE_TYPE_LABELS.WITH_DRIVER,
    icon: UserCheck,
  },
];

interface BookingModalProps {
  car: CarItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BookingModal({ car, open, onOpenChange }: BookingModalProps) {
  const {
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
  } = useBookingForm(car, () => onOpenChange(false));

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-obsidian/80 backdrop-blur-sm" />
        <DialogPrimitive.Content className="booking-sheet fixed inset-x-0 bottom-0 z-50 max-h-[90dvh] w-full overflow-y-auto rounded-t-2xl border-t border-gold/25 bg-carbon p-6 text-white shadow-2xl md:inset-x-auto md:bottom-auto md:left-1/2 md:top-1/2 md:w-[92vw] md:max-w-md md:rounded-2xl md:border md:border-gold/25">
          <div
            aria-hidden="true"
            className="mx-auto mb-4 h-1 w-10 rounded-full bg-hairline md:hidden"
          />

          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogPrimitive.Title className="font-display text-lg font-bold tracking-tight text-white">
                Booking {car.name}
              </DialogPrimitive.Title>
              <p className="mt-0.5 font-mono text-xs font-medium text-gold">
                {formatRupiah(car.pricePerDay)} / hari
              </p>
            </div>
            <DialogPrimitive.Close
              className="rounded-md p-1.5 text-brand-muted transition-colors hover:bg-obsidian hover:text-white"
              aria-label="Tutup form booking"
            >
              <X className="h-5 w-5" />
            </DialogPrimitive.Close>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label
                htmlFor={`booking-name-${car.id}`}
                className="mb-1.5 block font-mono text-[11px] font-medium tracking-wider text-brand-muted uppercase"
              >
                Nama Lengkap
              </label>
              <input
                id={`booking-name-${car.id}`}
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Masukkan nama Anda"
                className="w-full rounded-lg border border-hairline bg-obsidian px-3 py-2.5 text-sm text-white placeholder:text-brand-muted/60 focus:border-gold focus:outline-none"
              />
            </div>

            <div>
              <span className="mb-1.5 block font-mono text-[11px] font-medium tracking-wider text-brand-muted uppercase">
                Jenis Layanan
              </span>
              <div
                role="radiogroup"
                aria-label="Jenis Layanan"
                className="grid grid-cols-2 gap-2"
              >
                {SERVICE_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = serviceType === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => setServiceType(opt.value)}
                      className={cn(
                        "flex h-10 items-center justify-center gap-2 rounded-lg border font-mono text-xs font-medium transition-colors",
                        isSelected
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

            <AvailabilityCalendar
              viewDate={viewDate}
              calendarCells={calendarCells}
              todayIso={todayIso}
              bookedSet={bookedSet}
              startDate={startDate}
              endDate={endDate}
              onSelectDate={handleDateClick}
              onPrevMonth={handlePrevMonth}
              onNextMonth={handleNextMonth}
            />

            {errorMsg && (
              <p className="font-mono text-xs font-medium text-red-400">
                {errorMsg}
              </p>
            )}

            <div className="space-y-1.5 rounded-xl border border-hairline bg-obsidian p-3.5 text-xs">
              <div className="flex justify-between">
                <span className="text-brand-muted">Layanan</span>
                <span className="font-mono font-semibold text-white">
                  {SERVICE_TYPE_LABELS[serviceType]}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-muted">Tanggal Mulai</span>
                <span className="font-mono font-semibold text-white">
                  {startDate ?? "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-muted">Tanggal Selesai</span>
                <span className="font-mono font-semibold text-white">
                  {endDate ?? "—"}
                </span>
              </div>
              <div className="flex justify-between border-t border-hairline pt-2 text-sm">
                <span className="font-semibold text-white">
                  Total ({totalDays} hari)
                </span>
                <span
                  key={totalPrice}
                  className="price-flash font-mono font-bold text-gold tabular-nums"
                >
                  {totalDays > 0 ? formatRupiah(totalPrice) : "—"}
                </span>
              </div>
            </div>

            <Button
              type="submit"
              variant="accent"
              className="h-11 w-full rounded-md font-display text-xs tracking-wider uppercase"
              disabled={!startDate || !endDate}
            >
              Konfirmasi Booking →
            </Button>
          </form>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
